import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import type { Workflow } from "@/lib/db/models";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";

const EXTERNAL_API_TIMEOUT_MS = 12_000;

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

/**
 * GET /api/workflows - Get workflows for current company with Real-time status sync
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
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const workflowsCollection = await Collections.workflows();

    const query: any = {
      companyId: user.companyId
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { emailSubject: { $regex: search, $options: 'i' } },
        { servicenowTicketId: { $regex: search, $options: 'i' } },
        { jiraTicketId: { $regex: search, $options: 'i' } }
      ];
    }

    let totalNew = 0;

    // --- SYNC-ON-READ: Ensure Mongo DB has latest tickets (with timeout to avoid 504) ---
    try {
      const fetchLimit = Math.min(limit, 50);
      const externalTickets = await withTimeout(
        servicenowClient.fetchTickets(fetchLimit, skip),
        EXTERNAL_API_TIMEOUT_MS
      ).catch(() => null);

      if (Array.isArray(externalTickets) && externalTickets.length > 0) {
        const newWorkflowsToInsert: any[] = [];

        for (const ticket of externalTickets) {
          // Check if ticket already exists in MongoDB
          // We use servicenowTicketId (ticket number) as unique identifier
          // Efficient lookup, could optimize with $in query for batch check but loop is simple for now
          const exists = await workflowsCollection.findOne({
            companyId: user.companyId,
            servicenowTicketId: ticket.number
          });

          if (!exists) {
            const statusVal = toWorkflowStatus(ticket.state);
            const now = new Date();
            newWorkflowsToInsert.push({
              companyId: user.companyId,
              emailId: `sync-${ticket.sys_id}`,
              emailSubject: ticket.short_description || 'No Description',
              emailFrom: ticket.caller_id || 'System',
              status: statusVal,
              startedAt: ticket.sys_created_on ? new Date(ticket.sys_created_on) : now,
              createdAt: now,
              completedAt: statusVal === 'completed' ? now : undefined,
              servicenowTicketId: ticket.number,
              jiraTicketId: ticket.jira_ticket_id || null,
              workflowData: {
                source: 'auto-sync',
                original_ticket: ticket
              }
            });
          } else {
            // Persist current status from ServiceNow into DB
            const newStatus = toWorkflowStatus(ticket.state);
            if (exists.status !== newStatus) {
              const update: any = { status: newStatus };
              if (newStatus === 'completed') update.completedAt = new Date();
              await workflowsCollection.updateOne(
                { _id: exists._id },
                { $set: update }
              );
            }
          }
        }

        if (newWorkflowsToInsert.length > 0) {
          await workflowsCollection.insertMany(newWorkflowsToInsert);
          totalNew = newWorkflowsToInsert.length;
          console.log(`[Auto-Sync] Persisted ${totalNew} new tickets to MongoDB`);
        } else {
          console.log(`[Auto-Sync] No new tickets found in this batch`);
        }
      }
    } catch (syncError) {
      console.warn("Auto-sync on read failed (continuing with existing DB data):", syncError);
    }

    // --- QUERY MONGODB ( Now includes newly synced items ) ---
    let companyWorkflows = await workflowsCollection
      .find(query)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    let total = await workflowsCollection.countDocuments(query);

    // --- REAL-TIME STATUS MERGE ---
    // Even though we just synced new items, existing items might have status updates.
    // Fetch live status for the displayed set.

    if (companyWorkflows.length > 0) {
      let liveSnMap: Record<string, string> = {};
      let liveJiraMap: Record<string, string> = {};

      try {
        const [snTickets, jiraIssues] = await Promise.all([
          withTimeout(servicenowClient.fetchTickets(limit, skip), EXTERNAL_API_TIMEOUT_MS).catch(() => []),
          withTimeout(jiraClient.fetchIssues(limit, skip), EXTERNAL_API_TIMEOUT_MS).catch(() => []),
        ]);

        (snTickets || []).forEach((t: any) => { if (t?.number) liveSnMap[t.number] = t.state; });
        (jiraIssues || []).forEach((i: any) => { if (i?.key && i?.fields?.status?.name) liveJiraMap[i.key] = i.fields.status.name; });
      } catch (e) {
        console.error("Real-time status fetch failed for workflow list:", e);
      }

      // Merge live status and persist changes to DB so frontend always reads correct state
      const bulkUpdates: { updateOne: { filter: { _id: any }; update: { $set: any } } }[] = [];
      companyWorkflows = companyWorkflows.map(w => {
        const liveSnStatus = w.servicenowTicketId ? liveSnMap[w.servicenowTicketId] : null;
        const liveJiraStatus = w.jiraTicketId ? liveJiraMap[w.jiraTicketId] : null;
        const mergedRaw = liveSnStatus || liveJiraStatus || w.status;
        const newStatus = toWorkflowStatus(mergedRaw);
        if (w._id && w.status !== newStatus) {
          const update: any = { status: newStatus };
          if (newStatus === 'completed') update.completedAt = new Date();
          bulkUpdates.push({
            updateOne: { filter: { _id: w._id }, update: { $set: update } }
          });
        }
        return { ...w, status: newStatus };
      });

      if (bulkUpdates.length > 0) {
        try {
          await workflowsCollection.bulkWrite(bulkUpdates);
        } catch (e) {
          console.warn("Failed to persist workflow status updates:", e);
        }
      }
    }

    return NextResponse.json({
      workflows: companyWorkflows,
      total,
      limit,
      skip,
      synced: totalNew // Inform client about sync activity if useful
    });
  } catch (error) {
    console.error("Get workflows error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
