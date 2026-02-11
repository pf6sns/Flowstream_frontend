import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { verifyPassword, generateToken } from "@/lib/auth";
import { objectIdToString } from "@/lib/db/utils";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const users = await Collections.users();
    const user = await users.findOne({ email, status: "active" });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await users.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Convert ObjectId to string
    const userId = objectIdToString(user._id);
    const companyId = objectIdToString(user.companyId);

    // Generate token
    const token = generateToken({
      userId,
      companyId,
      email: user.email,
      role: user.role,
    });

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

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
