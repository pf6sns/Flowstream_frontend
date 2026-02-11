import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { objectIdToString } from "@/lib/db/utils";

/**
 * GET /api/companies - Get all companies (admin only) or current user's company
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await Collections.companies();

    // If admin, get all companies; otherwise, get user's company
    if (user.role === "admin") {
      const allCompanies = await companies.find({}).toArray();
      // Convert ObjectIds to strings
      const formattedCompanies = allCompanies.map((company) => ({
        ...company,
        _id: objectIdToString(company._id),
      }));
      return NextResponse.json({ companies: formattedCompanies });
    }

    // Convert companyId to ObjectId for query
    const companyId = typeof user.companyId === "string" && ObjectId.isValid(user.companyId)
      ? new ObjectId(user.companyId)
      : user.companyId;
    
    const company = await companies.findOne({ _id: companyId });
    
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      company: {
        ...company,
        _id: objectIdToString(company._id),
      },
    });
  } catch (error) {
    console.error("Get companies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies - Create new company (for demo requests)
 */
export async function POST(request: NextRequest) {
  try {
    const { name, domain, industry, adminEmail } = await request.json();

    if (!name || !domain || !adminEmail) {
      return NextResponse.json(
        { error: "Name, domain, and admin email are required" },
        { status: 400 }
      );
    }

    const companies = await Collections.companies();

    // Check if company already exists
    const existing = await companies.findOne({ domain });
    if (existing) {
      return NextResponse.json(
        { error: "Company with this domain already exists" },
        { status: 409 }
      );
    }

    const newCompany = {
      name,
      domain,
      industry: industry || "",
      status: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await companies.insertOne(newCompany);

    return NextResponse.json({
      success: true,
      company: {
        id: objectIdToString(result.insertedId),
        ...newCompany,
        _id: objectIdToString(result.insertedId),
      },
    });
  } catch (error) {
    console.error("Create company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
