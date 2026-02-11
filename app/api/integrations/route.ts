import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import type { CompanyIntegration } from "@/lib/db/models";

type IntegrationType = CompanyIntegration["integrationType"];

function buildSafeConfig(
  integrationType: IntegrationType,
  rawConfig: Record<string, any> | null,
  publicConfig?: Record<string, unknown>,
) {
  if (!rawConfig) return undefined;

  switch (integrationType) {
    case "jira":
      // Never expose full API token back to UI
      {
        const token =
          typeof rawConfig.apiToken === "string" ? rawConfig.apiToken : "";
        const hasToken = Boolean(token);
        const prefix = hasToken ? token.slice(0, 5) : "";
        const maskedToken = hasToken
          ? prefix + "*".repeat(Math.max(token.length - 5, 0))
          : "";

      return {
        baseUrl:
          (publicConfig?.baseUrl as string | undefined) ??
          (rawConfig.baseUrl ?? ""),
        email:
          (publicConfig?.email as string | undefined) ??
          (rawConfig.email ?? ""),
        projectKey:
          (publicConfig?.projectKey as string | undefined) ??
          (rawConfig.projectKey ?? ""),
        issueType:
          (publicConfig?.issueType as string | undefined) ??
          (rawConfig.issueType ?? ""),
          hasToken,
          maskedToken,
      };
      }
    case "servicenow":
      return {
        instanceUrl: rawConfig.instanceUrl ?? "",
        username: rawConfig.username ?? "",
        table: rawConfig.table ?? "incident",
      };
    case "gmail":
      return {
        provider: rawConfig.provider ?? "gmail",
        smtpHost: rawConfig.smtpHost ?? "",
        smtpPort: rawConfig.smtpPort ?? 587,
        fromName: rawConfig.fromName ?? "",
        email: rawConfig.username ?? rawConfig.fromEmail ?? "",
      };
    case "groq":
      // Only expose provider selection, never API keys
      return {
        provider: rawConfig.provider ?? "groq",
      };
    default:
      return undefined;
  }
}

/**
 * GET /api/integrations - Get all integrations for current company
 * Returns safe metadata plus a redacted configuration snapshot.
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

    const safeIntegrations = companyIntegrations.map((integration) => {
      let rawConfig: Record<string, any> | null = null;
      try {
        if (integration.configJson) {
          const decrypted = decrypt(integration.configJson);
          rawConfig = JSON.parse(decrypted);
        }
      } catch (e) {
        // If decryption or parsing fails, continue without config
        console.error(
          `Failed to decrypt integration config for ${integration.integrationType}:`,
          e,
        );
      }

      const config = buildSafeConfig(
        integration.integrationType as IntegrationType,
        rawConfig,
        (integration.publicConfig as Record<string, unknown> | undefined),
      );

      return {
        _id: integration._id,
        companyId: integration.companyId,
        integrationType: integration.integrationType,
        status: integration.status,
        lastSyncedAt: integration.lastSyncedAt,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
        config,
      };
    });

    return NextResponse.json({ integrations: safeIntegrations });
  } catch (error) {
    console.error("Get integrations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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

    const body: { integrationType: IntegrationType; config: Record<string, any> } =
      await request.json();

    const { integrationType, config } = body;

    if (!integrationType || !config) {
      return NextResponse.json(
        { error: "Integration type and config are required" },
        { status: 400 }
      );
    }

    // For Jira we keep non-sensitive metadata (URL, email, etc.) in plain JSON
    // and only encrypt the sensitive parts (like API tokens).
    let encryptedConfig: string;
    let publicConfig: Record<string, unknown> | undefined;

    if (integrationType === "jira") {
      const {
        baseUrl,
        email,
        projectKey,
        issueType,
        apiToken,
        ...rest
      } = config as Record<string, unknown>;

      publicConfig = {
        baseUrl: baseUrl ?? "",
        email: email ?? "",
        projectKey,
        issueType,
      };

      // Only sensitive values + any extra fields go into the encrypted blob.
      const sensitivePayload = {
        apiToken,
        ...rest,
      };

      encryptedConfig = encrypt(JSON.stringify(sensitivePayload));
    } else {
      // For other integrations we still encrypt the full config object.
      encryptedConfig = encrypt(JSON.stringify(config));
    }

    const integrations = await Collections.integrations();

    // Check if integration already exists
    const existing = await integrations.findOne({
      companyId: user.companyId,
      integrationType,
    });

    if (existing) {
      // For Jira, if no new apiToken was provided, keep the existing encrypted token
      let configJsonToStore = encryptedConfig;
      if (integrationType === "jira") {
        const tokenFromRequest = (config as Record<string, unknown>).apiToken;
        if (
          typeof tokenFromRequest !== "string" ||
          tokenFromRequest.trim().length === 0
        ) {
          configJsonToStore = existing.configJson;
        }
      }

      // Update existing
      await integrations.updateOne(
        { _id: existing._id },
        {
          $set: {
            configJson: configJsonToStore,
            status: "connected",
            updatedAt: new Date(),
            ...(publicConfig ? { publicConfig } : {}),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Integration updated successfully",
      });
    } else {
      // Create new
      const newIntegration: CompanyIntegration = {
        companyId: user.companyId,
        integrationType,
        configJson: encryptedConfig,
        status: "connected" as const,
        ...(publicConfig ? { publicConfig } : {}),
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
