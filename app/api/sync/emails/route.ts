import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";

/**
 * POST /api/sync/emails
 * Trigger manual sync of emails to start new workflows.
 * This calls the ServiceNow backend which handles email polling and workflow creation.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const integrations = await Collections.integrations();

        const gmailIntegration = await integrations.findOne({
            companyId: user.companyId,
            integrationType: 'gmail',
            status: 'connected'
        });

        if (!gmailIntegration) {
            return NextResponse.json({ error: "Gmail integration not connected" }, { status: 400 });
        }

        // Trigger the ServiceNow backend to check emails and create workflows
        console.log("[EMAIL SYNC] Triggering ServiceNow backend workflow...");
        const result = await servicenowClient.triggerManualWorkflow();

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 500 });
        }

        console.log("[EMAIL SYNC] ServiceNow workflow triggered successfully");

        // Save workflows to database
        if (result.data && result.data.processed_tickets) {
            const workflows = await Collections.workflows();
            let addedCount = 0;

            for (const ticket of result.data.processed_tickets) {
                // Check if already exists
                const existing = await workflows.findOne({
                    companyId: user.companyId,
                    emailId: ticket.email.messageId || ticket.email.id // Depends on structure
                });

                if (!existing) {
                    const now = new Date();
                    await workflows.insertOne({
                        companyId: user.companyId,
                        emailId: ticket.email.messageId || `email-${Date.now()}-${Math.random()}`,
                        emailSubject: ticket.summary.short_description || ticket.email.subject,
                        emailFrom: ticket.email.from,
                        status: 'completed',
                        startedAt: now,
                        createdAt: now,
                        completedAt: now,
                        servicenowTicketId: ticket.ticket_number,
                        jiraTicketId: ticket.jira_ticket ? ticket.jira_ticket.key : null,
                        workflowData: {
                            email: ticket.email,
                            steps: [
                                { id: 1, name: 'Email Received', status: 'completed', timestamp: new Date().toISOString() },
                                { id: 2, name: 'AI Classification', status: 'completed', timestamp: new Date().toISOString() },
                                { id: 3, name: 'ServiceNow Ticket Created', status: 'completed', timestamp: new Date().toISOString() }
                            ],
                            logs: [
                                { level: 'info', message: `Ticket created: ${ticket.ticket_number}`, timestamp: new Date().toISOString() }
                            ]
                        }
                    });
                    addedCount++;
                }
            }
            console.log(`[EMAIL SYNC] Added ${addedCount} new workflows from real data`);
        }

        return NextResponse.json({
            success: true,
            message: result.message || "Email sync triggered successfully.",
            data: result.data
        });

    } catch (error) {
        console.error("Sync emails error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
