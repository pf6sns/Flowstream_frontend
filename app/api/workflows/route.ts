import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/workflows - Get workflows for current company
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

    const workflows = await Collections.workflows();

    const query: any = { companyId: user.companyId };
    if (status) {
      query.status = status;
    }

    const companyWorkflows = await workflows
      .find(query)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await workflows.countDocuments(query);

    return NextResponse.json({
      workflows: companyWorkflows,
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
