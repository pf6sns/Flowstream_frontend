import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";

/**
 * GET /api/workflows/[id] - Get a single workflow by ID with live external data
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const workflows = await Collections.workflows();

        let query: any = { companyId: user.companyId };
        try {
            if (ObjectId.isValid(id)) {
                query._id = new ObjectId(id);
            } else {
                query._id = id;
            }
        } catch {
            query._id = id;
        }

        const workflow = await workflows.findOne(query);

        if (!workflow) {
            // FALLBACK: Check if this is a virtual workflow (ID matches a ServiceNow sys_id)
            try {
                // Fetch recent tickets to find a match
                // We fetch a decent number to increase chances of finding it in the "live" set
                const tickets = await servicenowClient.fetchTickets(100, 0); // Need to get enough tickets to find recent ones
                const matchedTicket = tickets.find(t => t.sys_id === id);

                if (matchedTicket) {
                    // Construct virtual workflow
                    const status = (['6', '7', 'Resolved', 'Closed'].includes(matchedTicket.state)) ? 'completed' : 'processing';
                    const virtualWorkflow = {
                        _id: matchedTicket.sys_id,
                        companyId: user.companyId,
                        emailSubject: matchedTicket.short_description || 'No Description',
                        emailFrom: matchedTicket.caller_id || 'System',
                        status: status,
                        startedAt: matchedTicket.sys_created_on ? new Date(matchedTicket.sys_created_on) : new Date(),
                        createdAt: matchedTicket.sys_created_on ? new Date(matchedTicket.sys_created_on) : new Date(),
                        servicenowTicketId: matchedTicket.number,
                        jiraTicketId: (matchedTicket as any).jira_ticket_id || null, // Backend sends this
                        workflowData: {
                            virtual: true,
                            email: {
                                subject: matchedTicket.short_description,
                                from: matchedTicket.caller_id,
                                body: matchedTicket.description || 'Virtual Workflow - Details fetched directly from API'
                            }
                        }
                    };

                    // Try to fetch Jira details if we have an ID
                    let liveJira: { status: string; assignee: string | undefined; updated: string; summary: string } | null = null;
                    if (virtualWorkflow.jiraTicketId) {
                        try {
                            const issue = await jiraClient.fetchIssueByKey(virtualWorkflow.jiraTicketId);
                            if (issue) {
                                liveJira = {
                                    status: issue.fields.status.name,
                                    assignee: issue.fields.assignee?.displayName,
                                    updated: issue.fields.updated,
                                    summary: issue.fields.summary
                                };
                            }
                        } catch (e) {
                            console.warn("Failed to fetch Jira details for virtual workflow", e);
                        }
                    }

                    const result = {
                        ...virtualWorkflow,
                        liveServiceNow: {
                            state: matchedTicket.state,
                            assigned_to: matchedTicket.assigned_to,
                            sys_updated_on: matchedTicket.sys_updated_on,
                            description: matchedTicket.short_description
                        },
                        liveJira
                    };

                    return NextResponse.json(result);
                }
            } catch (fallbackError) {
                console.error("Fallback workflow fetch failed:", fallbackError);
            }

            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        // --- Standard Workflow Handling (Found in Mongo) ---

        // Enrich with live data from ServiceNow
        let liveServiceNow = null;
        if (workflow.servicenowTicketId) {
            try {
                // Ideally fetch single ticket by number efficiently
                const ticket = await servicenowClient.fetchTicketByNumber(workflow.servicenowTicketId);
                if (ticket) {
                    liveServiceNow = {
                        state: ticket.state,
                        assigned_to: ticket.assigned_to,
                        sys_updated_on: ticket.sys_updated_on,
                        description: ticket.short_description
                    };
                }
            } catch (e) {
                console.error("Failed to fetch live ServiceNow data:", e);
            }
        }

        // Enrich with live data from Jira
        let liveJira = null;
        if (workflow.jiraTicketId) {
            try {
                const issue = await jiraClient.fetchIssueByKey(workflow.jiraTicketId);
                if (issue) {
                    liveJira = {
                        status: issue.fields.status.name,
                        assignee: issue.fields.assignee?.displayName,
                        updated: issue.fields.updated,
                        summary: issue.fields.summary
                    };
                }
            } catch (e) {
                console.error("Failed to fetch live Jira data:", e);
            }
        }

        return NextResponse.json({
            ...workflow,
            liveServiceNow,
            liveJira
        });

    } catch (error) {
        console.error("Get workflow error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
