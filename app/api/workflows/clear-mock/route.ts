import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";

/**
 * DELETE /api/workflows/clear-mock
 * Clear mock/test workflows from the database
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workflows = await Collections.workflows();

        // Delete workflows that don't have a servicenowTicketId (likely mock data)
        // Or delete all workflows without real email IDs
        const result = await workflows.deleteMany({
            companyId: user.companyId,
            $or: [
                { emailId: { $regex: /^msg-/ } }, // Mock email IDs start with "msg-"
                { emailSubject: { $in: ["Laptop screen flickering", "Request for Adobe license"] } } // Known mock subjects
            ]
        });

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} mock workflows`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Clear mock workflows error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
