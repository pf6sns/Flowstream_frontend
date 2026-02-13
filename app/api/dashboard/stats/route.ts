import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";
import type { Workflow } from "@/lib/db/models";

/** Timeout for external APIs (ServiceNow, Jira) to avoid 504 Gateway Timeout */
const EXTERNAL_API_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), ms)
        ),
    ]);
}

/** Map ServiceNow/Jira status strings to stored Workflow.status */
function toWorkflowStatus(raw: string | null | undefined): Workflow["status"] {
    if (raw == null || raw === "") return "processing";
    const s = String(raw).toLowerCase();
    if (["6", "7", "resolved", "closed", "done", "completed", "solved"].includes(s)) return "completed";
    if (["failed", "cancelled", "canceled"].includes(s)) return "failed";
    return "processing";
}

export const maxDuration = 30;

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "today";
        const refresh = searchParams.get("refresh") === "true";

        const statsCollection = await Collections.dashboardStats();
        const workflowsCollection = await Collections.workflows();
        const activityLogsCollection = await Collections.activityLogs();

        // 1. Try to get existing stats from DB first
        const existingStats = await statsCollection.findOne({
            companyId: user.companyId,
            range
        });

        // 2. If not refreshing and stats exist, return them (with live activity)
        if (!refresh && existingStats) {
            const [recentLogs, latestWorkflow] = await Promise.all([
                activityLogsCollection.find({ companyId: user.companyId }).sort({ createdAt: -1 }).limit(8).toArray(),
                workflowsCollection.findOne({ companyId: user.companyId, status: "processing" }, { sort: { startedAt: -1 } })
            ]);

            return NextResponse.json({
                range,
                stats: existingStats.stats,
                recentActivity: recentLogs,
                liveWorkflow: latestWorkflow,
                lastUpdated: existingStats.lastUpdated
            });
        }

        // 3. If refreshing or no stats, perform SYNC and Calculation
        console.log(`[Stats API] Performing ${refresh ? 'manual' : 'initial'} refresh...`);

        // Calculate start time for the range
        const now = new Date();
        const startTime = new Date();
        if (range === "today") startTime.setHours(0, 0, 0, 0);
        else if (range === "week") startTime.setDate(now.getDate() - 7);
        else if (range === "month") startTime.setDate(now.getDate() - 30);
        else if (range === "year") startTime.setFullYear(now.getFullYear() - 1);

        // Fetch external data to update our local cache (Workflows)
        const [snTickets, jiraIssues] = await Promise.all([
            withTimeout(servicenowClient.fetchTickets(100, 0), EXTERNAL_API_TIMEOUT_MS).catch(() => []),
            withTimeout(jiraClient.fetchIssues(100, 0), EXTERNAL_API_TIMEOUT_MS).catch(() => []),
        ]);

        // Sync tickets into Workflows collection (similar to workflows/route.ts sync-on-read)
        const allExternal = [...(snTickets || []), ...(jiraIssues || [])];
        if (allExternal.length > 0) {
            const bulkOps: any[] = [];

            // ServiceNow sync
            (snTickets || []).forEach((t: any) => {
                if (!t.number) return;
                const status = toWorkflowStatus(t.state);
                const update: any = {
                    companyId: user.companyId,
                    emailSubject: t.short_description || 'No Description',
                    emailFrom: t.caller_id || 'System',
                    status: status,
                    startedAt: t.sys_created_on ? new Date(t.sys_created_on) : new Date(),
                    servicenowTicketId: t.number,
                    jiraTicketId: t.jira_ticket_id || null,
                };
                if (status === 'completed') update.completedAt = new Date();

                bulkOps.push({
                    updateOne: {
                        filter: { companyId: user.companyId, servicenowTicketId: t.number },
                        update: {
                            $set: update,
                            $setOnInsert: { createdAt: new Date(), workflowData: { source: 'stats-sync' } }
                        },
                        upsert: true
                    }
                });
            });

            // Jira sync (if we have a mapping or just as standalone workflows)
            (jiraIssues || []).forEach((i: any) => {
                if (!i.key) return;
                const status = toWorkflowStatus(i.fields.status.name);
                const update: any = {
                    companyId: user.companyId,
                    emailSubject: i.fields.summary || 'No Description',
                    emailFrom: i.fields.creator?.displayName || 'Jira',
                    status: status,
                    startedAt: new Date(i.fields.created),
                    jiraTicketId: i.key,
                };
                if (status === 'completed') update.completedAt = new Date();

                bulkOps.push({
                    updateOne: {
                        filter: { companyId: user.companyId, jiraTicketId: i.key },
                        update: {
                            $set: update,
                            $setOnInsert: { createdAt: new Date(), workflowData: { source: 'stats-sync' } }
                        },
                        upsert: true
                    }
                });
            });

            if (bulkOps.length > 0) {
                await workflowsCollection.bulkWrite(bulkOps);
            }
        }

        // Now calculate stats FROM THE DB (Workflows collection)
        // Aggregation to get counts by status and source
        const statsQuery: any = { companyId: user.companyId, startedAt: { $gte: startTime } };

        const allWorkflowsInRange = await workflowsCollection.find(statsQuery).toArray();

        const snFiltered = allWorkflowsInRange.filter(w => !!w.servicenowTicketId);
        const jiraFiltered = allWorkflowsInRange.filter(w => !!w.jiraTicketId && !w.servicenowTicketId); // Standalone Jira

        // Note: In this system, ServiceNow usually creates a Jira ticket, 
        // so we avoid double counting if they are linked.

        const stats = {
            total: allWorkflowsInRange.length,
            globalInProgress: allWorkflowsInRange.filter(w => w.status === 'processing').length,
            globalResolved: allWorkflowsInRange.filter(w => w.status === 'completed').length,
            globalClosed: allWorkflowsInRange.filter(w => w.status === 'completed').length, // Simplification
            servicenow: {
                total: snFiltered.length,
                inProgress: snFiltered.filter(w => w.status === 'processing').length,
                resolved: snFiltered.filter(w => w.status === 'completed').length,
                closed: snFiltered.filter(w => w.status === 'completed').length,
                completed: snFiltered.filter(w => w.status === 'completed').length,
            },
            jira: {
                total: jiraFiltered.length,
                todo: jiraFiltered.filter(w => w.status === 'processing').length, // Simplification
                inProgress: jiraFiltered.filter(w => w.status === 'processing').length,
                done: jiraFiltered.filter(w => w.status === 'completed').length,
            },
            activeWorkflows: await workflowsCollection.countDocuments({ companyId: user.companyId, status: "processing" }),
            emailsProcessed: allWorkflowsInRange.length
        };

        // Save these calculated stats to DB
        await statsCollection.updateOne(
            { companyId: user.companyId, range },
            {
                $set: {
                    stats,
                    lastUpdated: new Date()
                }
            },
            { upsert: true }
        );

        const [recentLogs, latestWorkflow] = await Promise.all([
            activityLogsCollection.find({ companyId: user.companyId }).sort({ createdAt: -1 }).limit(8).toArray(),
            workflowsCollection.findOne({ companyId: user.companyId, status: "processing" }, { sort: { startedAt: -1 } })
        ]);

        return NextResponse.json({
            range,
            stats,
            recentActivity: recentLogs,
            liveWorkflow: latestWorkflow,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
