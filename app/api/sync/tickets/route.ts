import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";

/**
 * POST /api/sync/tickets
 * Trigger a manual sync of old tickets from connected integrations.
 */
export async function POST(request: NextRequest) {
    try {
        console.log("[SYNC] Starting ticket sync...");

        const user = await getCurrentUser(request);
        console.log("[SYNC] User:", user ? user.email : "null");

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const integrations = await Collections.integrations();
        const ticketsCollection = await Collections.tickets();
        console.log("[SYNC] Collections initialized");

        // Get all connected integrations
        const connectedIntegrations = await integrations.find({
            companyId: user.companyId,
            status: 'connected',
            integrationType: { $in: ['servicenow', 'jira'] }
        }).toArray();

        console.log(`[SYNC] Found ${connectedIntegrations.length} connected integrations`);

        // If no integrations, still return success but with 0 count
        if (connectedIntegrations.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No connected integrations found. Please connect ServiceNow or Jira first."
            });
        }

        let syncedCount = 0;

        for (const integration of connectedIntegrations) {
            console.log(`[SYNC] Processing integration: ${integration.integrationType}`);

            let externalTickets: any[] = [];

            // Fetch real tickets from backend services
            if (integration.integrationType === 'servicenow') {
                const tickets = await servicenowClient.fetchTickets();
                console.log(`[SYNC] Fetched ${tickets.length} tickets from ServiceNow`);

                // Transform ServiceNow tickets to our format
                externalTickets = tickets.map(ticket => ({
                    servicenowTicketId: ticket.number,
                    subject: ticket.short_description,
                    description: ticket.description || '',
                    status: ticket.state,
                    priority: ticket.priority || 'Normal',
                    category: ticket.category || 'Uncategorized',
                    createdAt: new Date(ticket.sys_created_on),
                    updatedAt: new Date(ticket.sys_updated_on),
                    assignedTo: ticket.assigned_to || ''
                }));
            } else if (integration.integrationType === 'jira') {
                const issues = await jiraClient.fetchIssues();
                console.log(`[SYNC] Fetched ${issues.length} issues from Jira`);

                // Transform Jira issues to our format
                externalTickets = issues.map(issue => ({
                    jiraTicketId: issue.key,
                    subject: issue.fields.summary,
                    description: issue.fields.description || '',
                    status: issue.fields.status.name,
                    priority: issue.fields.priority?.name || 'Normal',
                    category: issue.fields.issuetype?.name || 'Software',
                    createdAt: new Date(issue.fields.created),
                    updatedAt: new Date(issue.fields.updated),
                    assignedTo: issue.fields.assignee?.displayName || ''
                }));
            }

            for (const ticket of externalTickets) {
                // Upsert ticket to avoid duplicates
                const filter: any = { companyId: user.companyId };
                if ('servicenowTicketId' in ticket && ticket.servicenowTicketId) {
                    filter.servicenowTicketId = ticket.servicenowTicketId;
                }
                if ('jiraTicketId' in ticket && ticket.jiraTicketId) {
                    filter.jiraTicketId = ticket.jiraTicketId;
                }

                // Only upsert if we have a unique ID
                if (filter.servicenowTicketId || filter.jiraTicketId) {
                    const result = await ticketsCollection.updateOne(
                        filter,
                        {
                            $set: { ...ticket, companyId: user.companyId },
                            $setOnInsert: { createdAt: ticket.createdAt }
                        },
                        { upsert: true }
                    );
                    if (result.upsertedCount > 0 || result.modifiedCount > 0) {
                        syncedCount++;
                    }
                }
            }
        }

        console.log(`[SYNC] Sync complete. Total synced: ${syncedCount}`);
        return NextResponse.json({
            success: true,
            message: `Synced ${syncedCount} tickets from external sources.`
        });

    } catch (error) {
        console.error("[SYNC] Sync tickets error:", error);
        return NextResponse.json(
            { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}
