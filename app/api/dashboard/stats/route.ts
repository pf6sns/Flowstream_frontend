import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";

/**
 * GET /api/dashboard/stats - Get granular dashboard statistics with real-time platform data
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "today";

        const now = new Date();
        const startTime = new Date();

        if (range === "today") startTime.setHours(0, 0, 0, 0);
        else if (range === "week") startTime.setDate(now.getDate() - 7);
        else if (range === "month") startTime.setDate(now.getDate() - 30);
        else if (range === "year") startTime.setFullYear(now.getFullYear() - 1);

        // Fetch Live counts from external APIs (Real-time probe)
        // We fetch a decent sample to categorize by status
        const [
            snTickets,
            jiraIssues,
            ticketsCollection,
            workflowsCollection,
            activityLogsCollection
        ] = await Promise.all([
            servicenowClient.fetchTickets(200, 0).catch(() => []),
            jiraClient.fetchIssues(200, 0).catch(() => []),
            Collections.tickets(),
            Collections.workflows(),
            Collections.activityLogs()
        ]);

        // Filter based on range
        const filteredSn = (snTickets as any[]).filter(t => new Date(t.sys_created_on.replace(' ', 'T')) >= startTime);
        const filteredJira = (jiraIssues as any[]).filter(t => new Date(t.fields.created) >= startTime);

        // Aggregation logic
        const snStats = {
            total: filteredSn.length,
            inProgress: filteredSn.filter(t => {
                const s = String(t.state).toLowerCase();
                return ["in progress", "work in progress", "2", "progressed"].includes(s);
            }).length,
            resolved: filteredSn.filter(t => {
                const s = String(t.state).toLowerCase();
                return ["resolved", "6", "solved"].includes(s);
            }).length,
            closed: filteredSn.filter(t => {
                const s = String(t.state).toLowerCase();
                return ["closed", "7"].includes(s);
            }).length,
        };

        const jiraStats = {
            total: filteredJira.length,
            todo: filteredJira.filter(t => {
                const s = t.fields.status.name.toLowerCase();
                return ["to do", "backlog", "selected for development", "new"].includes(s);
            }).length,
            inProgress: filteredJira.filter(t => {
                const s = t.fields.status.name.toLowerCase();
                return ["in progress", "in service", "progressed", "in review", "testing", "qa"].includes(s);
            }).length,
            done: filteredJira.filter(t => {
                const s = t.fields.status.name.toLowerCase();
                return ["done", "completed", "resolved", "closed"].includes(s);
            }).length,
        };

        const [activeWorkflows, recentLogs, latestWorkflow] = await Promise.all([
            workflowsCollection.countDocuments({ companyId: user.companyId, status: "processing" }),
            activityLogsCollection.find({ companyId: user.companyId }).sort({ createdAt: -1 }).limit(8).toArray(),
            workflowsCollection.findOne({ companyId: user.companyId, status: "processing" }, { sort: { startedAt: -1 } })
        ]);

        return NextResponse.json({
            range,
            stats: {
                total: snStats.total + jiraStats.total,
                globalInProgress: snStats.inProgress + jiraStats.inProgress,
                globalResolved: snStats.resolved + jiraStats.done,
                globalClosed: snStats.closed,
                servicenow: {
                    ...snStats,
                    completed: snStats.resolved + snStats.closed
                },
                jira: jiraStats,
                activeWorkflows,
                emailsProcessed: snStats.total + jiraStats.total // Synced approximation
            },
            recentActivity: recentLogs,
            liveWorkflow: latestWorkflow
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
