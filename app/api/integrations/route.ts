import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";

/**
 * GET /api/integrations - Get all integrations for current company
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrations = await Collections.integrations();
    const companyIntegrations = await integrations
      .find({ companyId: user.companyId })
      .toArray();

    // Decrypt config for display (but don't expose full credentials)
    const safeIntegrations = companyIntegrations.map((integration) => ({
      _id: integration._id,
      companyId: integration.companyId,
      integrationType: integration.integrationType,
      status: integration.status,
      lastSyncedAt: integration.lastSyncedAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
      // Don't expose full config, just status
    }));

    return NextResponse.json({ integrations: safeIntegrations });
  } catch (error) {
    console.error("Get integrations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations - Create or update integration
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || (user.role !== "admin" && user.role !== "hr")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      integrationType,
      config,
    }: { integrationType: string; config: Record<string, any> } =
      await request.json();

    if (!integrationType || !config) {
      return NextResponse.json(
        { error: "Integration type and config are required" },
        { status: 400 }
      );
    }

    // Encrypt config
    const encryptedConfig = encrypt(JSON.stringify(config));

    const integrations = await Collections.integrations();

    // Check if integration already exists
    const existing = await integrations.findOne({
      companyId: user.companyId,
      integrationType,
    });

    if (existing) {
      // Update existing
      await integrations.updateOne(
        { _id: existing._id },
        {
          $set: {
            configJson: encryptedConfig,
            status: "connected",
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Integration updated successfully",
      });
    } else {
      // Create new
      const newIntegration = {
        companyId: user.companyId,
        integrationType,
        configJson: encryptedConfig,
        status: "connected" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await integrations.insertOne(newIntegration);

      return NextResponse.json({
        success: true,
        message: "Integration created successfully",
      });
    }
  } catch (error) {
    console.error("Create integration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
