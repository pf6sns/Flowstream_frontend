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
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        // Enrich with live data from ServiceNow
        let liveServiceNow = null;
        if (workflow.servicenowTicketId) {
            try {
                const tickets = await servicenowClient.fetchTickets();
                const matched = tickets.find(t => t.number === workflow.servicenowTicketId);
                if (matched) {
                    liveServiceNow = {
                        state: matched.state,
                        assigned_to: matched.assigned_to,
                        sys_updated_on: matched.sys_updated_on,
                        description: matched.short_description
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
                const issues = await jiraClient.fetchIssues();
                const matched = issues.find(i => i.key === workflow.jiraTicketId);
                if (matched) {
                    liveJira = {
                        status: matched.fields.status.name,
                        assignee: matched.fields.assignee?.displayName,
                        updated: matched.fields.updated,
                        summary: matched.fields.summary
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
