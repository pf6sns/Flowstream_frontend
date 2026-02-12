import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
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

    const companyWorkflows = await workflowsCollection
      .find(query)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await workflowsCollection.countDocuments(query);

    // --- REAL-TIME STATUS MERGE ---
    // Fetch live tickets from ServiceNow and Jira to get latest statuses
    let liveSnMap: Record<string, string> = {};
    let liveJiraMap: Record<string, string> = {};

    try {
      const [snTickets, jiraIssues] = await Promise.all([
        servicenowClient.fetchTickets(20, 0),
        jiraClient.fetchIssues(20, 0)
      ]);

      snTickets.forEach(t => liveSnMap[t.number] = t.state);
      jiraIssues.forEach(i => liveJiraMap[i.key] = i.fields.status.name);
    } catch (e) {
      console.error("Real-time status fetch failed for workflow list:", e);
    }

    // Merge live status into workflows
    const workflowsWithLiveStatus = companyWorkflows.map(w => {
      const liveSnStatus = w.servicenowTicketId ? liveSnMap[w.servicenowTicketId] : null;
      const liveJiraStatus = w.jiraTicketId ? liveJiraMap[w.jiraTicketId] : null;

      return {
        ...w,
        // If we have a live status, use it instead of the transition state 'processing'/'completed'
        // providing a much richer real-time experience on the cards.
        status: liveSnStatus || liveJiraStatus || w.status
      };
    });

    return NextResponse.json({
      workflows: workflowsWithLiveStatus,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error("Get workflows error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
