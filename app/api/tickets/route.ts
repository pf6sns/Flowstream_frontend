import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";

/**
 * GET /api/tickets - Get tickets from external sources (Real-time)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = parseInt(searchParams.get("skip") || "0");
        const source = searchParams.get("source"); // 'db', 'servicenow', 'jira', or undefined (both external)

        // Mode 1: Fetch locally from DB (if source='db')
        if (source === 'db') {
            const ticketsCollection = await Collections.tickets();
            const query: any = { companyId: user.companyId };
            if (status && status !== 'all') query.status = status;

            const tickets = await ticketsCollection.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .toArray();

            const total = await ticketsCollection.countDocuments(query);
            return NextResponse.json({ tickets, total, limit, skip, source: 'db' });
        }

        // Mode 2: Fetch from external sources (Real-time)
        let allTickets: any[] = [];

        // Determine fetch depth. We need enough to provide a good paginated view.
        // If sorting or filtering in memory, we need a decent sample.
        const fetchDepth = Math.max(100, skip + limit * 2);

        // Fetch ServiceNow
        try {
            const snTickets = await servicenowClient.fetchTickets(fetchDepth, 0);
            const formattedSn = snTickets.map(t => ({
                _id: `sn-${t.sys_id}`, // Virtual ID
                servicenowTicketId: t.number,
                subject: t.short_description,
                description: t.description,
                status: t.state,
                priority: t.priority,
                category: t.category,
                createdAt: t.sys_created_on?.replace(' ', 'T') || new Date().toISOString(), // Ensure ISO format
                updatedAt: t.sys_updated_on?.replace(' ', 'T') || new Date().toISOString(),
                assignedTo: t.assigned_to,
                source: 'ServiceNow'
            }));
            allTickets = [...allTickets, ...formattedSn];
        } catch (e) {
            console.error("Failed to fetch from ServiceNow:", e);
        }

        // Fetch Jira
        try {
            const jiraIssues = await jiraClient.fetchIssues(fetchDepth, 0);
            const formattedJira = jiraIssues.map(i => ({
                _id: `jira-${i.id}`, // Virtual ID
                jiraTicketId: i.key,
                subject: i.fields.summary,
                description: i.fields.description,
                status: i.fields.status.name,
                priority: i.fields.priority?.name || 'Normal',
                category: i.fields.issuetype?.name || 'Task',
                createdAt: i.fields.created,
                updatedAt: i.fields.updated,
                assignedTo: i.fields.assignee?.displayName || 'Unassigned',
                source: 'Jira'
            }));
            allTickets = [...allTickets, ...formattedJira];
        } catch (e) {
            console.error("Failed to fetch from Jira:", e);
        }

        // Apply basic filtering (in-memory since we fetched a buffer)
        if (status && status !== 'all') {
            allTickets = allTickets.filter(t => t.status?.toLowerCase() === status.toLowerCase());
        }

        // Sort by date desc
        allTickets.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });

        // Pagination
        const paginatedTickets = allTickets.slice(skip, skip + limit);

        return NextResponse.json({
            tickets: paginatedTickets,
            total: allTickets.length,
            limit,
            skip,
            source: 'external (real-time)'
        });

    } catch (error) {
        console.error("Get tickets error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
