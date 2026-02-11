import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// GET /api/auth/me - returns minimal info about the currently authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

