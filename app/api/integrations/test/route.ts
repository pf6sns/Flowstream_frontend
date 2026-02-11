import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import type { CompanyIntegration } from "@/lib/db/models";

type IntegrationType = CompanyIntegration["integrationType"];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationType } = (await request.json()) as {
      integrationType?: IntegrationType;
    };

    if (!integrationType) {
      return NextResponse.json(
        { error: "integrationType is required" },
        { status: 400 },
      );
    }

    const integrations = await Collections.integrations();
    const integration = await integrations.findOne({
      companyId: user.companyId,
      integrationType,
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not configured yet" },
        { status: 404 },
      );
    }

    // Decrypt sensitive config
    let rawConfig: Record<string, any> = {};
    if (integration.configJson) {
      try {
        const decrypted = decrypt(integration.configJson);
        rawConfig = JSON.parse(decrypted);
      } catch (e) {
        console.error("Failed to decrypt integration config:", e);
        return NextResponse.json(
          { error: "Stored configuration is invalid or corrupted" },
          { status: 500 },
        );
      }
    }

    // Merge non-sensitive public config
    const publicConfig = (integration.publicConfig ??
      {}) as Record<string, any>;

    switch (integrationType) {
      case "jira": {
        const baseUrl: string = publicConfig.baseUrl || rawConfig.baseUrl;
        const email: string = publicConfig.email || rawConfig.email;
        const apiToken: string = rawConfig.apiToken;

        if (!baseUrl || !email || !apiToken) {
          return NextResponse.json(
            {
              error:
                "Jira configuration is incomplete. Please check URL, email, and API token.",
            },
            { status: 400 },
          );
        }

        const url = `${baseUrl.replace(/\/$/, "")}/rest/api/3/myself`;
        const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Jira test failed:", response.status, text);
          return NextResponse.json(
            {
              error: `Jira connection failed (status ${response.status}). Please verify your URL, email, and API token.`,
            },
            { status: 502 },
          );
        }

        return NextResponse.json({
          success: true,
          message: "Jira connection successful.",
        });
      }

      case "servicenow": {
        const instanceUrl: string =
          publicConfig.instanceUrl || rawConfig.instanceUrl;
        const username: string = publicConfig.username || rawConfig.username;
        const password: string = rawConfig.password;
        const table: string = publicConfig.table || rawConfig.table || "incident";

        if (!instanceUrl || !username || !password) {
          return NextResponse.json(
            {
              error:
                "ServiceNow configuration is incomplete. Please check instance URL, username, and password/API token.",
            },
            { status: 400 },
          );
        }

        const url = `${instanceUrl.replace(
          /\/$/,
          "",
        )}/api/now/table/${encodeURIComponent(table)}?sysparm_limit=1`;
        const auth = Buffer.from(`${username}:${password}`).toString("base64");

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("ServiceNow test failed:", response.status, text);
          return NextResponse.json(
            {
              error: `ServiceNow connection failed (status ${response.status}). Please verify your instance URL and credentials.`,
            },
            { status: 502 },
          );
        }

        return NextResponse.json({
          success: true,
          message: "ServiceNow connection successful.",
        });
      }

      case "gmail": {
        // For now we just validate that required fields exist.
        const email: string =
          publicConfig.username ||
          publicConfig.fromEmail ||
          rawConfig.username ||
          rawConfig.fromEmail;
        const password: string = rawConfig.password;

        if (!email || !password) {
          return NextResponse.json(
            {
              error:
                "Email configuration is incomplete. Please check address and app password.",
            },
            { status: 400 },
          );
        }

        return NextResponse.json({
          success: true,
          message:
            "Email configuration looks valid. SMTP connectivity test is not implemented yet.",
        });
      }

      case "groq": {
        const provider: string =
          publicConfig.provider || rawConfig.provider || "groq";
        const apiKey: string = rawConfig.apiKey;

        if (!apiKey) {
          return NextResponse.json(
            {
              error:
                "AI provider configuration is incomplete. Please add an API key.",
            },
            { status: 400 },
          );
        }

        // We don't call the provider API here yet, just validate presence.
        return NextResponse.json({
          success: true,
          message: `${provider.toUpperCase()} configuration looks valid.`,
        });
      }

      default:
        return NextResponse.json(
          { error: "Unsupported integration type" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Test integration error:", error);
    return NextResponse.json(
      { error: "Internal server error while testing integration" },
      { status: 500 },
    );
  }
}

