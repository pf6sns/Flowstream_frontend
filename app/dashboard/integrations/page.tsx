"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, PlugZap } from "lucide-react";
import {
  IntegrationCard,
  JiraForm,
  ServiceNowForm,
  EmailForm,
  AIForm,
  type IntegrationType,
  type IntegrationConfigByType,
  type StatusMap,
  type ConfigMap,
  type IntegrationsApiResponse,
  type JiraConfig,
  type ServiceNowConfig,
  type EmailConfig,
  type AIConfig,
} from "@/components/integration";

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [configs, setConfigs] = useState<ConfigMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<IntegrationType | null>(null);
  const [saving, setSaving] = useState<IntegrationType | null>(null);
  const [testing, setTesting] = useState<Partial<Record<IntegrationType, boolean>>>({});
  const [testResults, setTestResults] = useState<
    Partial<Record<IntegrationType, { status: "success" | "error"; message: string }>>
  >({});

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/integrations", { cache: "no-store" });
        if (res.status === 401) {
          setError("You need to be signed in to view integrations. Please log in and reload this page.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data: IntegrationsApiResponse = await res.json();
        const statusMap: StatusMap = {};
        const configMap: ConfigMap = {};
        (data.integrations ?? []).forEach((item) => {
          const type = item.integrationType;
          statusMap[type] = {
            integrationType: type,
            status: item.status,
            lastSyncedAt: item.lastSyncedAt,
          };

          if (item.config) {
            switch (type) {
              case "jira":
                configMap.jira = item.config as JiraConfig;
                break;
              case "servicenow":
                configMap.servicenow = item.config as ServiceNowConfig;
                break;
              case "gmail":
                configMap.gmail = item.config as EmailConfig;
                break;
              case "groq":
                configMap.groq = item.config as AIConfig;
                break;
            }
          }
        });
        setStatuses(statusMap);
        setConfigs(configMap);
      } catch (err) {
        console.error("Error loading integrations:", err);
        setError("Unable to load integration status.");
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  const statusLabel = (t: IntegrationType): { label: string; className: string } => {
    const st = statuses[t]?.status ?? "disconnected";
    if (st === "connected") {
      return {
        label: "Connected",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };
    }
    if (st === "error") {
      return {
        label: "Error",
        className: "bg-red-50 text-red-700 ring-red-100",
      };
    }
    return {
      label: "Disconnected",
      className: "bg-slate-50 text-slate-600 ring-slate-100",
    };
  };

  const lastSyncLabel = (t: IntegrationType) => {
    const ts = statuses[t]?.lastSyncedAt;
    if (!ts) return "Not synced yet";
    return new Date(ts).toLocaleString();
  };

  const saveIntegration = async <T extends IntegrationType>(
    type: T,
    config: IntegrationConfigByType[T]
  ) => {
    try {
      setSaving(type);
      setError(null);
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationType: type, config }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setError("Your session has expired or you are not signed in. Please log in again.");
        return;
      }
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save integration.");
        return;
      }
      setStatuses((prev) => ({
        ...prev,
        [type]: {
          integrationType: type,
          status: "connected",
          lastSyncedAt: new Date().toISOString(),
        },
      }));
      setConfigs((prev) => ({
        ...prev,
        [type]: config,
      }));
    } catch (err) {
      console.error("Error saving integration:", err);
      setError("Failed to save integration.");
    } finally {
      setSaving(null);
    }
  };

  const testConnection = async (type: IntegrationType) => {
    try {
      setTesting((prev) => ({ ...prev, [type]: true }));
      setTestResults((prev) => ({ ...prev, [type]: undefined }));
      setError(null);

      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationType: type }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTestResults((prev) => ({
          ...prev,
          [type]: {
            status: "error",
            message: "Authentication required. Please log in and try again.",
          },
        }));
        return;
      }

      if (res.status === 404) {
        setTestResults((prev) => ({
          ...prev,
          [type]: {
            status: "error",
            message: data.error || "Integration not configured. Please save your settings first.",
          },
        }));
        return;
      }

      if (!res.ok) {
        setTestResults((prev) => ({
          ...prev,
          [type]: {
            status: "error",
            message: data.error || "Connection test failed. Please check your settings and try again.",
          },
        }));
        return;
      }

      setTestResults((prev) => ({
        ...prev,
        [type]: {
          status: "success",
          message: data.message || "Connection successful.",
        },
      }));
    } catch (err) {
      console.error("Error testing integration:", err);
      setTestResults((prev) => ({
        ...prev,
        [type]: {
          status: "error",
          message: "Unable to test connection. Please check your internet connection and try again.",
        },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text lg:text-3xl">
            Integrations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Connect Flowstream to your Jira, ServiceNow, email, and AI providers.
          </p>
        </div>
        <PlugZap className="hidden h-8 w-8 text-brand lg:block" />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <IntegrationCard
          title="Jira"
          description="Sync technical tickets with your Jira workspace."
          status={statusLabel("jira")}
          lastSync={lastSyncLabel("jira")}
          loading={loading}
          isOpen={openPanel === "jira"}
          onToggle={() => setOpenPanel((prev) => (prev === "jira" ? null : "jira"))}
          onTest={() => testConnection("jira")}
          testing={Boolean(testing["jira"])}
          testResult={testResults["jira"]}
        >
          <JiraForm
            key={JSON.stringify(configs["jira"])}
            initialConfig={configs["jira"]}
            saving={saving === "jira"}
            onSave={(config) => saveIntegration("jira", config)}
          />
        </IntegrationCard>

        <IntegrationCard
          title="ServiceNow"
          description="Connect to your ServiceNow instance for incident tracking."
          status={statusLabel("servicenow")}
          lastSync={lastSyncLabel("servicenow")}
          loading={loading}
          isOpen={openPanel === "servicenow"}
          onToggle={() => setOpenPanel((prev) => (prev === "servicenow" ? null : "servicenow"))}
          onTest={() => testConnection("servicenow")}
          testing={Boolean(testing["servicenow"])}
          testResult={testResults["servicenow"]}
        >
          <ServiceNowForm
            key={JSON.stringify(configs["servicenow"])}
            initialConfig={configs["servicenow"]}
            saving={saving === "servicenow"}
            onSave={(config) => saveIntegration("servicenow", config)}
          />
        </IntegrationCard>

        <IntegrationCard
          title="Email"
          description="Use your own email provider for notifications."
          status={statusLabel("gmail")}
          lastSync={lastSyncLabel("gmail")}
          loading={loading}
          isOpen={openPanel === "gmail"}
          onToggle={() => setOpenPanel((prev) => (prev === "gmail" ? null : "gmail"))}
          onTest={() => testConnection("gmail")}
          testing={Boolean(testing["gmail"])}
          testResult={testResults["gmail"]}
        >
          <EmailForm
            key={JSON.stringify(configs["gmail"])}
            initialConfig={configs["gmail"]}
            saving={saving === "gmail"}
            onSave={(config) => saveIntegration("gmail", config)}
          />
        </IntegrationCard>

        <IntegrationCard
          title="AI Provider"
          description="Optionally use your own AI provider and API key."
          status={statusLabel("groq")}
          lastSync={lastSyncLabel("groq")}
          loading={loading}
          isOpen={openPanel === "groq"}
          onToggle={() => setOpenPanel((prev) => (prev === "groq" ? null : "groq"))}
          onTest={() => testConnection("groq")}
          testing={Boolean(testing["groq"])}
          testResult={testResults["groq"]}
        >
          <AIForm
            key={JSON.stringify(configs["groq"])}
            initialConfig={configs["groq"]}
            saving={saving === "groq"}
            onSave={(config) => saveIntegration("groq", config)}
          />
        </IntegrationCard>
      </div>
    </div>
  );
}
