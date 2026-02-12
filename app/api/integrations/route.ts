import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import type { CompanyIntegration } from "@/lib/db/models";

type IntegrationType = CompanyIntegration["integrationType"];

/**
 * Build config to return to frontend.
 * - Non-sensitive fields come from publicConfig (stored in plain text)
 * - Sensitive fields (passwords, API keys) are returned with:
 *   - The actual decrypted value (so user can view it with eye toggle)
 *   - A flag indicating if the value exists (hasToken, hasPassword, hasApiKey)
 */
function buildSafeConfig(
  integrationType: IntegrationType,
  rawConfig: Record<string, any> | null,
  publicConfig?: Record<string, unknown>,
) {
  switch (integrationType) {
    case "jira": {
      const apiToken =
        rawConfig && typeof rawConfig.apiToken === "string"
          ? rawConfig.apiToken
          : "";
      const hasToken = Boolean(apiToken);

      return {
        baseUrl: (publicConfig?.baseUrl as string) ?? "",
        email: (publicConfig?.email as string) ?? "",
        projectKey: (publicConfig?.projectKey as string) ?? "",
        issueType: (publicConfig?.issueType as string) ?? "",
        hasToken,
        // Return actual token so user can view it with eye toggle
        apiToken: apiToken,
      };
    }
    case "servicenow": {
      const password =
        rawConfig && typeof rawConfig.password === "string"
          ? rawConfig.password
          : "";
      const hasPassword = Boolean(password);

      return {
        instanceUrl: (publicConfig?.instanceUrl as string) ?? "",
        username: (publicConfig?.username as string) ?? "",
        table: (publicConfig?.table as string) ?? "incident",
        hasPassword,
        // Return actual password so user can view it with eye toggle
        password: password,
      };
    }
    case "gmail": {
      const password =
        rawConfig && typeof rawConfig.password === "string"
          ? rawConfig.password
          : "";
      const hasPassword = Boolean(password);

      return {
        provider: (publicConfig?.provider as string) ?? "gmail",
        smtpHost: (publicConfig?.smtpHost as string) ?? "",
        smtpPort: (publicConfig?.smtpPort as number) ?? 587,
        fromName: (publicConfig?.fromName as string) ?? "",
        fromEmail: (publicConfig?.fromEmail as string) ?? "",
        username: (publicConfig?.username as string) ?? "",
        hasPassword,
        // Return actual password so user can view it with eye toggle
        password: password,
      };
    }
    case "groq": {
      const apiKey =
        rawConfig && typeof rawConfig.apiKey === "string"
          ? rawConfig.apiKey
          : "";
      const hasApiKey = Boolean(apiKey);

      return {
        provider: (publicConfig?.provider as string) ?? "groq",
        hasApiKey,
        // Return actual API key so user can view it with eye toggle
        apiKey: apiKey,
      };
    }
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

    // Store non-sensitive fields in publicConfig (plain text in DB)
    // Store only sensitive fields (passwords, API keys) encrypted in configJson
    let encryptedConfig: string;
    let publicConfig: Record<string, unknown> | undefined;

    if (integrationType === "jira") {
      const { apiToken, ...nonSensitive } = config as Record<string, unknown>;

      publicConfig = {
        baseUrl: nonSensitive.baseUrl ?? "",
        email: nonSensitive.email ?? "",
        projectKey: nonSensitive.projectKey ?? "",
        issueType: nonSensitive.issueType ?? "",
      };

      // Only encrypt the API token
      encryptedConfig = encrypt(JSON.stringify({ apiToken }));
    } else if (integrationType === "servicenow") {
      const { password, ...nonSensitive } = config as Record<string, unknown>;

      publicConfig = {
        instanceUrl: nonSensitive.instanceUrl ?? "",
        username: nonSensitive.username ?? "",
        table: nonSensitive.table ?? "incident",
      };

      // Only encrypt the password
      encryptedConfig = encrypt(JSON.stringify({ password }));
    } else if (integrationType === "gmail") {
      const { password, ...nonSensitive } = config as Record<string, unknown>;

      publicConfig = {
        provider: nonSensitive.provider ?? "gmail",
        smtpHost: nonSensitive.smtpHost ?? "",
        smtpPort: nonSensitive.smtpPort ?? 587,
        username: nonSensitive.username ?? "",
        fromEmail: nonSensitive.fromEmail ?? "",
        fromName: nonSensitive.fromName ?? "",
      };

      // Only encrypt the password
      encryptedConfig = encrypt(JSON.stringify({ password }));
    } else if (integrationType === "groq") {
      const { apiKey, ...nonSensitive } = config as Record<string, unknown>;

      publicConfig = {
        provider: nonSensitive.provider ?? "groq",
      };

      // Only encrypt the API key
      encryptedConfig = encrypt(JSON.stringify({ apiKey }));
    } else {
      // Fallback: encrypt entire config
      encryptedConfig = encrypt(JSON.stringify(config));
    }

    const integrations = await Collections.integrations();

    // Check if integration already exists
    const existing = await integrations.findOne({
      companyId: user.companyId,
      integrationType,
    });

    if (existing) {
      // If no new sensitive value was provided, keep the existing encrypted config
      let configJsonToStore = encryptedConfig;

      const sensitiveFieldMap: Record<IntegrationType, string> = {
        jira: "apiToken",
        servicenow: "password",
        gmail: "password",
        groq: "apiKey",
      };

      const sensitiveField = sensitiveFieldMap[integrationType];
      if (sensitiveField) {
        const sensitiveValue = (config as Record<string, unknown>)[sensitiveField];
        // If sensitive field is empty or not provided, keep existing encrypted config
        if (
          typeof sensitiveValue !== "string" ||
          sensitiveValue.trim().length === 0
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
