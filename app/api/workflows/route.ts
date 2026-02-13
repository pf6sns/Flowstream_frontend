import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import type { Workflow } from "@/lib/db/models";
import { getCurrentUser } from "@/lib/auth";
import { servicenowClient } from "@/lib/integrations/servicenow";
import { jiraClient } from "@/lib/integrations/jira";


/**
 * GET /api/workflows - Get workflows for current company with Real-time status sync
 */
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

    // --- SYNC-ON-READ: Ensure Mongo DB has latest tickets for this view ---
    try {
      console.log("Checking backend for new tickets...");
      // Fetch corresponding page of tickets from Python Backend (SQLite)
      const fetchLimit = limit; // Fetch potentially new tickets
      const externalTickets = await servicenowClient.fetchTickets(fetchLimit, skip);

      if (externalTickets && externalTickets.length > 0) {
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
            // Map to Workflow schema
            // Determine initial status based on ticket state
            const isClosed = ['6', '7', 'Resolved', 'Closed', 'Done'].includes(ticket.state);
            const statusVal = isClosed ? 'completed' : 'processing';

            newWorkflowsToInsert.push({
              companyId: user.companyId,
              emailId: `sync-${ticket.sys_id}`, // Unique ID for mongo
              emailSubject: ticket.short_description || 'No Description',
              emailFrom: ticket.caller_id || 'System',
              status: statusVal,
              startedAt: ticket.sys_created_on ? new Date(ticket.sys_created_on) : new Date(),
              createdAt: new Date(), // When synced to our DB
              servicenowTicketId: ticket.number,
              jiraTicketId: ticket.jira_ticket_id || null,
              workflowData: {
                source: 'auto-sync',
                original_ticket: ticket
              }
            });
          } else {
            // OPTIONAL: Update status if changed? 
            // For now, we rely on the live-merge logic below for status *display* to avoid heavy writes on every read.
            // But if we want *persistence* of status, we could update here.
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
        // Fetch live status for the *displayed* tickets only, ideally.
        // But fetchTickets returns a page.
        // Since we know the numbers, we could query specific IDs, but existing logic fetches paginated.
        // Let's stick to existing logic for simplicity.
        const [snTickets, jiraIssues] = await Promise.all([
          servicenowClient.fetchTickets(limit, skip),
          jiraClient.fetchIssues(limit, skip) // Assuming correlation
        ]);

        snTickets.forEach((t: any) => liveSnMap[t.number] = t.state);
        jiraIssues.forEach((i: any) => liveJiraMap[i.key] = i.fields.status.name);
      } catch (e) {
        console.error("Real-time status fetch failed for workflow list:", e);
      }

      // Merge live status into workflows (cast so merged value satisfies Workflow.status)
      companyWorkflows = companyWorkflows.map(w => {
        const liveSnStatus = w.servicenowTicketId ? liveSnMap[w.servicenowTicketId] : null;
        const liveJiraStatus = w.jiraTicketId ? liveJiraMap[w.jiraTicketId] : null;
        return {
          ...w,
          status: (liveSnStatus || liveJiraStatus || w.status) as Workflow["status"]
        };
      });
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
