import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";

const EXTERNAL_API_TIMEOUT_MS = 10_000;
const MAX_EXTERNAL_FETCH_DEPTH = 100;
const MAX_TICKETS_LIMIT = 100;

/**
 * GET /api/tickets - Get tickets from external sources (Real-time)
 */
export const maxDuration = 30;

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const requestedLimit = parseInt(searchParams.get("limit") || "50");
        const requestedSkip = parseInt(searchParams.get("skip") || "0");
        const limit = Math.min(
            MAX_TICKETS_LIMIT,
            Number.isFinite(requestedLimit) ? Math.max(1, requestedLimit) : 50
        );
        const skip = Number.isFinite(requestedSkip) ? Math.max(0, requestedSkip) : 0;
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
            return NextResponse.json({
                tickets,
                total,
                limit,
                skip,
                requestedLimit,
                source: 'db'
            });
        }

        // Mode 2: Fetch from external sources (Real-time)
        let allTickets: any[] = [];

        // Keep upstream work bounded so serverless requests don't hang until the platform returns 504.
        const fetchDepth = Math.min(MAX_EXTERNAL_FETCH_DEPTH, Math.max(limit, skip + limit));

        const shouldFetchServiceNow = !source || source === "servicenow";
        const shouldFetchJira = !source || source === "jira";

        const [snResult, jiraResult] = await Promise.allSettled([
            shouldFetchServiceNow
                ? servicenowClient.fetchTickets(fetchDepth, 0, { timeoutMs: EXTERNAL_API_TIMEOUT_MS })
                : Promise.resolve([]),
            shouldFetchJira
                ? jiraClient.fetchIssues(fetchDepth, 0, { timeoutMs: EXTERNAL_API_TIMEOUT_MS })
                : Promise.resolve([]),
        ]);

        if (snResult.status === "fulfilled") {
            const formattedSn = snResult.value.map(t => ({
                _id: `sn-${t.sys_id}`,
                servicenowTicketId: t.number,
                subject: t.short_description,
                description: t.description,
                status: t.state,
                priority: t.priority,
                category: t.category,
                createdAt: t.sys_created_on?.replace(' ', 'T') || new Date().toISOString(),
                updatedAt: t.sys_updated_on?.replace(' ', 'T') || new Date().toISOString(),
                assignedTo: t.assigned_to,
                source: 'ServiceNow'
            }));
            allTickets = [...allTickets, ...formattedSn];
        } else {
            console.error("Failed to fetch from ServiceNow:", snResult.reason);
        }

        if (jiraResult.status === "fulfilled") {
            const formattedJira = jiraResult.value.map(i => ({
                _id: `jira-${i.id}`,
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
        } else {
            console.error("Failed to fetch from Jira:", jiraResult.reason);
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
            requestedLimit,
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
