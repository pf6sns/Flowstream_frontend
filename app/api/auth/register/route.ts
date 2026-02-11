import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { hashPassword, generateToken } from "@/lib/auth";
import { objectIdToString } from "@/lib/db/utils";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, companyId, companyName } = await request.json();

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const users = await Collections.users();
    const companies = await Collections.companies();
    
    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    let finalCompanyId = companyId;

    // If company name is provided, create or find company
    if (companyName && !companyId) {
      const existingCompany = await companies.findOne({ 
        $or: [
          { name: companyName },
          { domain: email.split("@")[1] }
        ]
      });

      if (existingCompany) {
        finalCompanyId = objectIdToString(existingCompany._id);
      } else {
        // Create new company
        const newCompany = {
          name: companyName,
          domain: email.split("@")[1],
          status: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const companyResult = await companies.insertOne(newCompany);
        finalCompanyId = objectIdToString(companyResult.insertedId);
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = {
      companyId: finalCompanyId ? new ObjectId(finalCompanyId) : "",
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      role: "admin" as const,
      status: "active" as const,
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    // Generate token
    const token = generateToken({
      userId: objectIdToString(result.insertedId),
      companyId: finalCompanyId || "",
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: objectIdToString(result.insertedId),
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        companyId: finalCompanyId,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
