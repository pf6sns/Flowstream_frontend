"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle2, PlugZap } from "lucide-react";

type IntegrationType = "jira" | "servicenow" | "gmail" | "groq";

type IntegrationStatus = {
  integrationType: IntegrationType;
  status: "connected" | "disconnected" | "error";
  lastSyncedAt?: string | null;
};

type JiraConfig = {
  baseUrl: string;
  email: string;
  apiToken?: string;
  projectKey?: string;
  issueType?: string;
  hasToken?: boolean;
  maskedToken?: string;
};

type ServiceNowConfig = {
  instanceUrl: string;
  username: string;
  password: string;
  table?: string;
};

type EmailProvider = "gmail" | "outlook" | "custom";

type EmailConfig = {
  provider: EmailProvider;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

type AIProvider = "openai" | "groq" | "gemini";

type AIConfig = {
  provider: AIProvider;
  apiKey: string;
};

type IntegrationConfigByType = {
  jira: JiraConfig;
  servicenow: ServiceNowConfig;
  gmail: EmailConfig;
  groq: AIConfig;
};

type StatusMap = Partial<Record<IntegrationType, IntegrationStatus>>;
type ConfigMap = Partial<IntegrationConfigByType>;

type IntegrationApiItem = {
  integrationType: IntegrationType;
  status: "connected" | "disconnected" | "error";
  lastSyncedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  config?: unknown;
};

type IntegrationsApiResponse = {
  integrations?: IntegrationApiItem[];
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [configs, setConfigs] = useState<ConfigMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<IntegrationType | null>(null);
  const [saving, setSaving] = useState<IntegrationType | null>(null);
  const [testing, setTesting] = useState<
    Partial<Record<IntegrationType, boolean>>
  >({});
  const [testResults, setTestResults] = useState<
    Partial<
      Record<
        IntegrationType,
        {
          status: "success" | "error";
          message: string;
        }
      >
    >
  >({});

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/integrations", { cache: "no-store" });
        if (res.status === 401) {
          setError("Your session has expired. Please sign in again.");
          setLoading(false);
          router.push("/login?from=/dashboard/integrations");
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
    config: IntegrationConfigByType[T],
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
        setError("Your session has expired. Please sign in again.");
        router.push("/login?from=/dashboard/integrations");
        return;
      }
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save integration.");
        return;
      }
      // Mark as connected locally and bump last sync timestamp
      setStatuses((prev) => ({
        ...prev,
        [type]: {
          integrationType: type,
          status: "connected",
          lastSyncedAt: new Date().toISOString(),
        },
      }));
      // We don't get the decrypted config back; keep what the user just entered
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
        setError("Your session has expired. Please sign in again.");
        router.push("/login?from=/dashboard/integrations");
        return;
      }

      if (!res.ok) {
        setTestResults((prev) => ({
          ...prev,
          [type]: {
            status: "error",
            message: data.error || "Connection test failed.",
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
          message: "Connection test failed. Please try again.",
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
        {/* Jira */}
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
            initialConfig={configs["jira"]}
            saving={saving === "jira"}
            onSave={(config) => saveIntegration("jira", config)}
          />
        </IntegrationCard>

        {/* ServiceNow */}
        <IntegrationCard
          title="ServiceNow"
          description="Connect to your ServiceNow instance for incident tracking."
          status={statusLabel("servicenow")}
          lastSync={lastSyncLabel("servicenow")}
          loading={loading}
          isOpen={openPanel === "servicenow"}
          onToggle={() =>
            setOpenPanel((prev) => (prev === "servicenow" ? null : "servicenow"))
          }
          onTest={() => testConnection("servicenow")}
          testing={Boolean(testing["servicenow"])}
          testResult={testResults["servicenow"]}
        >
          <ServiceNowForm
            initialConfig={configs["servicenow"]}
            saving={saving === "servicenow"}
            onSave={(config) => saveIntegration("servicenow", config)}
          />
        </IntegrationCard>

        {/* Email / SMTP */}
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
            initialConfig={configs["gmail"]}
            saving={saving === "gmail"}
            onSave={(config) => saveIntegration("gmail", config)}
          />
        </IntegrationCard>

        {/* AI Provider */}
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
            initialConfig={configs["groq"]}
            saving={saving === "groq"}
            onSave={(config) => saveIntegration("groq", config)}
          />
        </IntegrationCard>
      </div>
    </div>
  );
}

type IntegrationCardProps = {
  title: string;
  description: string;
  status: { label: string; className: string };
  lastSync: string;
  loading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onTest: () => void;
  testing: boolean;
  testResult?:
    | {
        status: "success" | "error";
        message: string;
      }
    | undefined;
  children: React.ReactNode;
};

function IntegrationCard({
  title,
  description,
  status,
  lastSync,
  loading,
  isOpen,
  onToggle,
  onTest,
  testing,
  testResult,
  children,
}: IntegrationCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
          <p className="mt-2 text-[11px] text-slate-400">Last sync: {lastSync}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${status.className}`}
        >
          {status.label === "Connected" && (
            <CheckCircle2 className="mr-1 h-3 w-3" />
          )}
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex gap-2 text-xs">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          type="button"
          disabled={loading}
          onClick={onToggle}
        >
          {isOpen ? "Close" : "Configure"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          type="button"
          disabled={loading}
        >
          Test connection
        </Button>
      </div>

      {testResult && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] ${
            testResult.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {testResult.status === "success" ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {isOpen && <div className="mt-4 border-t border-slate-100 pt-4">{children}</div>}
    </section>
  );
}

// Jira form
function JiraForm({
  initialConfig,
  saving,
  onSave,
}: {
  initialConfig?: JiraConfig;
  saving: boolean;
  onSave: (config: JiraConfig) => void;
}) {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [issueType, setIssueType] = useState("");

  useEffect(() => {
    if (initialConfig) {
      if (!baseUrl && initialConfig.baseUrl) setBaseUrl(initialConfig.baseUrl);
      if (!email && initialConfig.email) setEmail(initialConfig.email);
      // Show masked token in the input (first 5 chars + *), but do not send it back as a real token
      if (!apiToken && initialConfig.maskedToken) {
        setApiToken(initialConfig.maskedToken);
      }
      if (!projectKey && initialConfig.projectKey) setProjectKey(initialConfig.projectKey);
      if (!issueType && initialConfig.issueType) setIssueType(initialConfig.issueType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: JiraConfig = {
      baseUrl,
      email,
      projectKey,
      issueType,
    };

    // Only send apiToken when user actually enters a new one
    // (different from the masked value we pre-filled).
    if (
      apiToken.trim().length > 0 &&
      apiToken !== initialConfig?.maskedToken
    ) {
      payload.apiToken = apiToken;
    }

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <p className="text-[11px] text-slate-500">
        Users should connect their own Jira workspace. We never show the API token again after
        saving.
      </p>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Jira Domain / Site URL *
        </label>
        <input
          type="url"
          required
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://company.atlassian.net"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">Jira Email *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@company.com"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Jira API Token *
          </label>
          {initialConfig?.hasToken && initialConfig.maskedToken && (
            <div className="group relative inline-flex items-center">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-500">
                i
              </span>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-md group-hover:block">
                <p>
                  For security we only show the first 5 characters of your
                  existing key. Paste a full new Jira API token here if you want
                  to update it; leaving this field empty will keep the current
                  key.
                </p>
              </div>
            </div>
          )}
        </div>
        <input
          type="password"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          placeholder="ATATT3x..."
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">
            Project Key (optional)
          </label>
          <input
            type="text"
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value)}
            placeholder="SUP"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">
            Default issue type (optional)
          </label>
          <input
            type="text"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            placeholder="Task / Incident"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
      <div className="pt-1">
        <Button type="submit" size="sm" disabled={saving} className="text-xs">
          {saving ? "Saving…" : "Save Jira settings"}
        </Button>
      </div>
    </form>
  );
}

// ServiceNow form
function ServiceNowForm({
  initialConfig,
  saving,
  onSave,
}: {
  initialConfig?: ServiceNowConfig;
  saving: boolean;
  onSave: (config: ServiceNowConfig) => void;
}) {
  const [instanceUrl, setInstanceUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [table, setTable] = useState("incident");

  useEffect(() => {
    if (initialConfig) {
      if (!instanceUrl && initialConfig.instanceUrl) setInstanceUrl(initialConfig.instanceUrl);
      if (!username && initialConfig.username) setUsername(initialConfig.username);
      if (!table && initialConfig.table) setTable(initialConfig.table);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      instanceUrl,
      username,
      password,
      table,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Instance URL *
        </label>
        <input
          type="url"
          required
          value={instanceUrl}
          onChange={(e) => setInstanceUrl(e.target.value)}
          placeholder="https://dev12345.service-now.com"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">Username *</label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="john.doe"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Password / API token *
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Table (optional)
        </label>
        <input
          type="text"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          placeholder="incident"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="pt-1">
        <Button type="submit" size="sm" disabled={saving} className="text-xs">
          {saving ? "Saving…" : "Save ServiceNow settings"}
        </Button>
      </div>
    </form>
  );
}

// Email / SMTP form
function EmailForm({
  initialConfig,
  saving,
  onSave,
}: {
  initialConfig?: EmailConfig;
  saving: boolean;
  onSave: (config: EmailConfig) => void;
}) {
  const [provider, setProvider] = useState<EmailProvider>("gmail");
  const [email, setEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState("Support Bot");

  useEffect(() => {
    if (initialConfig) {
      if (!email && initialConfig.email) setEmail(initialConfig.email);
      if (!smtpHost && initialConfig.smtpHost) setSmtpHost(initialConfig.smtpHost);
      if (initialConfig.smtpPort && smtpPort === 587) setSmtpPort(initialConfig.smtpPort);
      if (!fromName && initialConfig.fromName) setFromName(initialConfig.fromName);
      if (initialConfig.provider) setProvider(initialConfig.provider);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      provider,
      smtpHost,
      smtpPort,
      username: email,
      password,
      fromEmail: email,
      fromName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Email address *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@gmail.com"
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">
            SMTP Provider *
          </label>
          <select
            value={provider}
            onChange={(e) => {
              const value = e.target.value as EmailProvider;
              setProvider(value);
              if (value === "gmail") setSmtpHost("smtp.gmail.com");
              if (value === "outlook") setSmtpHost("smtp.office365.com");
            }}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">
            App Password *
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••• •••• •••• ••••"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">
            SMTP Server *
          </label>
          <input
            type="text"
            required
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">
            Port *
          </label>
          <input
            type="number"
            min={1}
            required
            value={smtpPort}
            onChange={(e) => setSmtpPort(Number(e.target.value))}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          From name
        </label>
        <input
          type="text"
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="pt-1">
        <Button type="submit" size="sm" disabled={saving} className="text-xs">
          {saving ? "Saving…" : "Save email settings"}
        </Button>
      </div>
    </form>
  );
}

// AI provider form
function AIForm({
  initialConfig,
  saving,
  onSave,
}: {
  initialConfig?: AIConfig;
  saving: boolean;
  onSave: (config: AIConfig) => void;
}) {
  const [provider, setProvider] = useState<AIProvider>("groq");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (initialConfig && initialConfig.provider) {
      setProvider(initialConfig.provider);
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ provider, apiKey });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          AI Provider
        </label>
        <select
          value={provider}
          onChange={(e) =>
            setProvider(e.target.value as "openai" | "groq" | "gemini")
          }
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="openai">OpenAI</option>
          <option value="groq">Groq</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          API Key
        </label>
        <input
          type="password"
          required
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="pt-1">
        <Button type="submit" size="sm" disabled={saving} className="text-xs">
          {saving ? "Saving…" : "Save AI settings"}
        </Button>
      </div>
    </form>
  );
}

