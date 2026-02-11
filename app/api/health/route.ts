import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * GET /api/health - Health check endpoint with MongoDB connection test
 */
export async function GET() {
  try {
    // Test MongoDB connection
    const db = await getDatabase();
    await db.admin().ping();

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
