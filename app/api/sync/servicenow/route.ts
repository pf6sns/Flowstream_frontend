import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";

/**
 * POST /api/sync/servicenow
 * Fetch existing ServiceNow tickets and import them as workflows if they don't exist.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all tickets from ServiceNow
        console.log("[SN SYNC] Fetching all tickets from ServiceNow backend...");
        const tickets = await servicenowClient.fetchTickets();

        const workflows = await Collections.workflows();
        let addedCount = 0;
        let updatedCount = 0;

        for (const ticket of tickets) {
            // Check if already exists in workflows by servicenowTicketId
            const existing = await workflows.findOne({
                companyId: user.companyId,
                servicenowTicketId: ticket.number
            });

            if (!existing) {
                // Create a "Legacy" workflow entry for manual tickets
                await workflows.insertOne({
                    companyId: user.companyId,
                    emailId: `sn-${ticket.sys_id || Date.now()}`,
                    emailSubject: ticket.short_description || 'No Description',
                    emailFrom: ticket.caller_id || 'manual-entry@system.local',
                    status: ticket.state === 'Resolved' || ticket.state === 'Closed' ? 'completed' : 'processing',
                    startedAt: ticket.sys_created_on ? new Date(ticket.sys_created_on) : new Date(),
                    createdAt: ticket.sys_created_on ? new Date(ticket.sys_created_on) : new Date(),
                    servicenowTicketId: ticket.number,
                    jiraTicketId: undefined, // Fix null type issues
                    workflowData: {
                        email: {
                            subject: ticket.short_description || 'No Subject',
                            from: ticket.caller_id || 'System',
                            body: ticket.description || 'Imported from ServiceNow'
                        },
                        steps: [
                            { id: 1, name: 'ServiceNow Import', status: 'completed', timestamp: ticket.sys_created_on || new Date().toISOString() }
                        ],
                        logs: [
                            { level: 'info', message: `Imported existing ticket: ${ticket.number}`, timestamp: new Date().toISOString() }
                        ]
                    }
                });
                addedCount++;
            } else {
                // Update status if it changed
                await workflows.updateOne(
                    { _id: existing._id },
                    { $set: { status: ticket.state === 'Resolved' || ticket.state === 'Closed' ? 'completed' : 'processing' } }
                );
                updatedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synchronization complete. Added ${addedCount} new workflows and updated ${updatedCount} existing items.`,
            added: addedCount,
            updated: updatedCount
        });

    } catch (error) {
        console.error("ServiceNow sync error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
