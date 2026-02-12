import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { verifyPassword, generateToken } from "@/lib/auth";
import { objectIdToString } from "@/lib/db/utils";

export async function POST(request: NextRequest) {
  try {
    console.log("🔵 [LOGIN] Request received");
    const { email, password } = await request.json();
    console.log("🔵 [LOGIN] Email:", email, "Password length:", password?.length);

    if (!email || !password) {
      console.warn("⚠️ [LOGIN] Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("🔵 [LOGIN] Getting users collection...");
    const users = await Collections.users();
    console.log("🔵 [LOGIN] Searching for user with email:", email);
    const user = await users.findOne({ email, status: "active" });

    if (!user) {
      console.warn("⚠️ [LOGIN] User not found or not active");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("🔵 [LOGIN] User found, verifying password...");
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      console.warn("⚠️ [LOGIN] Password verification failed");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    console.log("🔵 [LOGIN] Updating last login...");
    await users.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Convert ObjectId to string
    const userId = objectIdToString(user._id);
    const companyId = objectIdToString(user.companyId);
    console.log("🔵 [LOGIN] User IDs converted. UserId:", userId, "CompanyId:", companyId);

    // Generate token
    console.log("🔵 [LOGIN] Generating token...");
    const token = generateToken({
      userId,
      companyId,
      email: user.email,
      role: user.role,
    });
    console.log("🔵 [LOGIN] Token generated successfully");

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: companyId,
      },
    });

    // Set cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("✅ [LOGIN] Login successful for:", email);
    return response;
  } catch (error) {
    console.error("❌ [LOGIN] Error occurred:", error);
    if (error instanceof Error) {
      console.error("❌ [LOGIN] Error message:", error.message);
      console.error("❌ [LOGIN] Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
