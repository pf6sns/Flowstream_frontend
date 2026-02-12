import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";

/**
 * GET /api/tickets/[id] - Get a single ticket
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Handle external IDs (sn-XXX, jira-XXX)
        if (id.startsWith('sn-')) {
            const snId = id.replace('sn-', '');
            // Fetch from ServiceNow
            try {
                const tickets = await servicenowClient.fetchTickets();
                const ticket = tickets.find(t => t.sys_id === snId || t.number === snId);

                if (ticket) {
                    // Try to find linked workflow
                    const workflowsCollection = await Collections.workflows();
                    const linkedWorkflow = await workflowsCollection.findOne({
                        companyId: user.companyId,
                        servicenowTicketId: ticket.number
                    });

                    return NextResponse.json({
                        _id: id,
                        servicenowTicketId: ticket.number,
                        subject: ticket.short_description,
                        description: ticket.description,
                        status: ticket.state,
                        priority: ticket.priority,
                        category: ticket.category,
                        createdAt: ticket.sys_created_on,
                        updatedAt: ticket.sys_updated_on,
                        assignedTo: ticket.assigned_to,
                        source: 'ServiceNow',
                        _linkedWorkflow: linkedWorkflow
                    });
                }
            } catch (e) {
                console.error("External fetch error:", e);
            }
            // If fetching failed or not found, we could fall through or just return 404
            return NextResponse.json({ error: "Ticket not found in ServiceNow" }, { status: 404 });
        }

        if (id.startsWith('jira-')) {
            const jiraId = id.replace('jira-', '');
            try {
                const issues = await jiraClient.fetchIssues();
                const issue = issues.find(i => i.id === jiraId || i.key === jiraId);

                if (issue) {
                    const workflowsCollection = await Collections.workflows();
                    const linkedWorkflow = await workflowsCollection.findOne({
                        companyId: user.companyId,
                        jiraTicketId: issue.key
                    });

                    return NextResponse.json({
                        _id: id,
                        jiraTicketId: issue.key,
                        subject: issue.fields.summary,
                        description: issue.fields.description,
                        status: issue.fields.status.name,
                        priority: issue.fields.priority?.name || 'Normal',
                        category: issue.fields.issuetype?.name || 'Task',
                        createdAt: issue.fields.created,
                        updatedAt: issue.fields.updated,
                        assignedTo: issue.fields.assignee?.displayName || 'Unassigned',
                        source: 'Jira',
                        _linkedWorkflow: linkedWorkflow
                    });
                }
            } catch (e) {
                console.error("External fetch error:", e);
            }
            return NextResponse.json({ error: "Issues not found in Jira" }, { status: 404 });
        }

        const ticketsCollection = await Collections.tickets();
        let query: any = { companyId: user.companyId };

        if (ObjectId.isValid(id)) {
            query._id = new ObjectId(id);
        } else {
            query.servicenowTicketId = id;
        }

        let ticket = await ticketsCollection.findOne(query);

        if (!ticket && !ObjectId.isValid(id)) {
            // Fallback 1: Try finding in DB by secondary ID
            ticket = await ticketsCollection.findOne({ companyId: user.companyId, servicenowTicketId: id });
        }

        // Fallback 2: Real-time fetch from ServiceNow if looking like a ticket number (INC*, RITM*, etc.)
        if (!ticket && (id.startsWith('INC') || id.startsWith('RITM') || id.startsWith('TASK'))) {
            try {
                // Fetch all/recent tickets from ServiceNow and find match
                // Note: In a production app, we would use a specific GET /table/incident?sysparm_query=number=ID endpoint
                // For now, adhering to the existing client pattern
                const tickets = await servicenowClient.fetchTickets();
                const externalTicket = tickets.find(t => t.number === id);

                if (externalTicket) {
                    // Try to find linked workflow
                    const workflowsCollection = await Collections.workflows();
                    const linkedWorkflow = await workflowsCollection.findOne({
                        companyId: user.companyId,
                        servicenowTicketId: externalTicket.number
                    });

                    return NextResponse.json({
                        _id: `sn-${externalTicket.sys_id}`, // Virtual ID
                        servicenowTicketId: externalTicket.number,
                        subject: externalTicket.short_description,
                        description: externalTicket.description,
                        status: externalTicket.state,
                        priority: externalTicket.priority,
                        category: externalTicket.category,
                        createdAt: externalTicket.sys_created_on,
                        updatedAt: externalTicket.sys_updated_on,
                        assignedTo: externalTicket.assigned_to,
                        source: 'ServiceNow',
                        _linkedWorkflow: linkedWorkflow
                    });
                }
            } catch (e) {
                console.error("ServiceNow fallback fetch error:", e);
            }
        }

        // Fallback 3: Real-time fetch from Jira if looking like a Jira key (PROJECT-123)
        if (!ticket && id.includes('-') && !id.startsWith('sn-') && !id.startsWith('jira-')) {
            try {
                const issues = await jiraClient.fetchIssues();
                const externalIssue = issues.find(i => i.key === id);

                if (externalIssue) {
                    const workflowsCollection = await Collections.workflows();
                    const linkedWorkflow = await workflowsCollection.findOne({
                        companyId: user.companyId,
                        jiraTicketId: externalIssue.key
                    });

                    return NextResponse.json({
                        _id: `jira-${externalIssue.id}`,
                        jiraTicketId: externalIssue.key,
                        subject: externalIssue.fields.summary,
                        description: externalIssue.fields.description,
                        status: externalIssue.fields.status.name,
                        priority: externalIssue.fields.priority?.name || 'Normal',
                        category: externalIssue.fields.issuetype?.name || 'Task',
                        createdAt: externalIssue.fields.created,
                        updatedAt: externalIssue.fields.updated,
                        assignedTo: externalIssue.fields.assignee?.displayName || 'Unassigned',
                        source: 'Jira',
                        _linkedWorkflow: linkedWorkflow
                    });
                }
            } catch (e) {
                console.error("Jira fallback fetch error:", e);
            }
        }

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Enhance ticket with workflow data if available
        let linkedWorkflow = null;
        if (ticket.workflowId) {
            const workflowsCollection = await Collections.workflows();
            try {
                linkedWorkflow = await workflowsCollection.findOne({ _id: new ObjectId(ticket.workflowId) });
            } catch { }
        }

        if (!linkedWorkflow && ticket.servicenowTicketId) {
            const workflowsCollection = await Collections.workflows();
            linkedWorkflow = await workflowsCollection.findOne({ servicenowTicketId: ticket.servicenowTicketId });
        }

        return NextResponse.json({
            ...ticket,
            _linkedWorkflow: linkedWorkflow
        });

    } catch (error) {
        console.error("Get ticket error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
