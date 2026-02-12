import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import type { CompanyIntegration } from "@/lib/db/models";

type IntegrationType = CompanyIntegration["integrationType"];

async function testJiraConnection(config: {
  baseUrl: string;
  email: string;
  apiToken: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");
    const response = await fetch(`${config.baseUrl}/rest/api/3/myself`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Invalid credentials. Please check your email address and API token. You may need to generate a new API token from your Atlassian account.",
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: "Jira domain not found. Please verify your Jira site URL is correct.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: `Unable to connect to Jira. Please check your domain URL and try again.`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: `Successfully connected to Jira as ${data.displayName || data.emailAddress || config.email}`,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Unable to reach Jira server. Please check your domain URL and internet connection.",
      };
    }
    return {
      success: false,
      message: "Connection failed. Please verify your settings and try again.",
    };
  }
}

async function testServiceNowConnection(config: {
  instanceUrl: string;
  username: string;
  password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${config.instanceUrl}/api/now/table/sys_user?sysparm_limit=1`;
    const auth = Buffer.from(`${config.username}:${config.password}`).toString("base64");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Invalid username or password. Please check your credentials and try again.",
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: "ServiceNow instance not found. Please verify your instance URL is correct.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: "Unable to connect to ServiceNow. Please verify your instance URL and credentials.",
      };
    }

    return { success: true, message: "Successfully connected to your ServiceNow instance" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Unable to reach ServiceNow server. Please check your instance URL and internet connection.",
      };
    }
    return {
      success: false,
      message: "Connection failed. Please verify your settings and try again.",
    };
  }
}

async function testEmailConnection(config: {
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const net = await import("net");
    return new Promise((resolve) => {
      const socket = net.createConnection(config.smtpPort, config.smtpHost, () => {
        socket.destroy();
        resolve({ success: true, message: "SMTP server connection successful" });
      });

      socket.setTimeout(5000);
      socket.on("timeout", () => {
        socket.destroy();
        resolve({
          success: false,
          message: "Connection timeout. Please check your SMTP server address and port number.",
        });
      });

      socket.on("error", (error) => {
        if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
          resolve({
            success: false,
            message: "SMTP server address not found. Please verify your SMTP host is correct.",
          });
        } else if (error.message.includes("ECONNREFUSED")) {
          resolve({
            success: false,
            message: "Unable to connect to SMTP server. Please check your SMTP host and port number.",
          });
        } else {
          resolve({
            success: false,
            message: "SMTP connection failed. Please verify your server settings and try again.",
          });
        }
      });
    });
  } catch {
    return {
      success: false,
      message: "SMTP connection test failed. Please check your configuration and try again.",
    };
  }
}

async function testAIConnection(config: {
  provider: string;
  apiKey: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    if (config.provider === "groq") {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        return {
          success: false,
          message: "Invalid Groq API key. Please check your API key and try again.",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: "Unable to connect to Groq API. Please verify your API key is correct.",
        };
      }

      return { success: true, message: "Groq API key is valid and working" };
    }

    if (config.provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        return {
          success: false,
          message: "Invalid OpenAI API key. Please check your API key and try again.",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: "Unable to connect to OpenAI API. Please verify your API key is correct.",
        };
      }

      return { success: true, message: "OpenAI API key is valid and working" };
    }

    if (config.provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${config.apiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 400 || response.status === 401) {
        return {
          success: false,
          message: "Invalid Gemini API key. Please check your API key and try again.",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: "Unable to connect to Gemini API. Please verify your API key is correct.",
        };
      }

      return { success: true, message: "Gemini API key is valid and working" };
    }

    return { success: false, message: "Unknown AI provider. Please select a valid provider." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Unable to reach API server. Please check your internet connection and try again.",
      };
    }
    return {
      success: false,
      message: "Connection test failed. Please verify your API key and try again.",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || (user.role !== "admin" && user.role !== "hr")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: { integrationType: IntegrationType } = await request.json();
    const { integrationType } = body;

    if (!integrationType) {
      return NextResponse.json({ error: "Integration type is required" }, { status: 400 });
    }

    const integrations = await Collections.integrations();
    const integration = await integrations.findOne({
      companyId: user.companyId,
      integrationType,
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not configured yet. Please save your settings first before testing the connection." },
        { status: 404 }
      );
    }

    let rawConfig: Record<string, unknown> | null = null;
    try {
      if (integration.configJson) {
        const decrypted = decrypt(integration.configJson);
        rawConfig = JSON.parse(decrypted) as Record<string, unknown>;
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to decrypt integration configuration" },
        { status: 500 }
      );
    }

    const publicConfig = (integration.publicConfig as Record<string, unknown> | undefined) ?? {};

    let result: { success: boolean; message: string };

    switch (integrationType) {
      case "jira": {
        const baseUrl = (publicConfig.baseUrl as string) ?? "";
        const email = (publicConfig.email as string) ?? "";
        const apiToken = (rawConfig?.apiToken as string) ?? "";

        if (!baseUrl) {
          return NextResponse.json(
            { error: "Please configure your Jira domain URL first." },
            { status: 400 }
          );
        }
        if (!email) {
          return NextResponse.json(
            { error: "Please enter your Jira email address." },
            { status: 400 }
          );
        }
        if (!apiToken) {
          return NextResponse.json(
            { error: "Please enter your Jira API token. You can generate one from your Atlassian account settings." },
            { status: 400 }
          );
        }

        result = await testJiraConnection({ baseUrl, email, apiToken });
        break;
      }

      case "servicenow": {
        const instanceUrl = (publicConfig.instanceUrl as string) ?? "";
        const username = (publicConfig.username as string) ?? "";
        const password = (rawConfig?.password as string) ?? "";

        if (!instanceUrl) {
          return NextResponse.json(
            { error: "Please enter your ServiceNow instance URL." },
            { status: 400 }
          );
        }
        if (!username) {
          return NextResponse.json(
            { error: "Please enter your ServiceNow username." },
            { status: 400 }
          );
        }
        if (!password) {
          return NextResponse.json(
            { error: "Please enter your ServiceNow password or API token." },
            { status: 400 }
          );
        }

        result = await testServiceNowConnection({ instanceUrl, username, password });
        break;
      }

      case "gmail": {
        const smtpHost = (publicConfig.smtpHost as string) ?? "";
        const smtpPort = (publicConfig.smtpPort as number) ?? 587;
        const username = (publicConfig.username as string) ?? "";
        const password = (rawConfig?.password as string) ?? "";

        if (!smtpHost) {
          return NextResponse.json(
            { error: "Please configure your SMTP server address." },
            { status: 400 }
          );
        }
        if (!username) {
          return NextResponse.json(
            { error: "Please enter your email address." },
            { status: 400 }
          );
        }
        if (!password) {
          return NextResponse.json(
            { error: "Please enter your email app password. For Gmail, you can generate one from your Google Account settings." },
            { status: 400 }
          );
        }

        result = await testEmailConnection({ smtpHost, smtpPort, username, password });
        break;
      }

      case "groq": {
        const provider = (publicConfig.provider as string) ?? "groq";
        const apiKey = (rawConfig?.apiKey as string) ?? "";

        if (!apiKey) {
          return NextResponse.json(
            { error: `Please enter your ${provider === "groq" ? "Groq" : provider === "openai" ? "OpenAI" : "Gemini"} API key.` },
            { status: 400 }
          );
        }

        result = await testAIConnection({ provider, apiKey });
        break;
      }

      default:
        return NextResponse.json({ error: "Unsupported integration type" }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Test integration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
