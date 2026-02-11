"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle2, PlugZap } from "lucide-react";

type IntegrationType = "jira" | "servicenow" | "gmail" | "groq";

type IntegrationStatus = {
  integrationType: IntegrationType;
  status: "connected" | "disconnected" | "error";
  lastSyncedAt?: string | null;
};

type StatusMap = Partial<Record<IntegrationType, IntegrationStatus>>;

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<IntegrationType | null>(null);
  const [saving, setSaving] = useState<IntegrationType | null>(null);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/integrations", { cache: "no-store" });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const map: StatusMap = {};
        (data.integrations ?? []).forEach((i: any) => {
          map[i.integrationType as IntegrationType] = {
            integrationType: i.integrationType,
            status: i.status,
            lastSyncedAt: i.lastSyncedAt,
          };
        });
        setStatuses(map);
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

  const saveIntegration = async (type: IntegrationType, config: Record<string, any>) => {
    try {
      setSaving(type);
      setError(null);
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationType: type, config }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save integration.");
        return;
      }
      // Mark as connected locally
      setStatuses((prev) => ({
        ...prev,
        [type]: {
          integrationType: type,
          status: "connected",
          lastSyncedAt: new Date().toISOString(),
        },
      }));
    } catch (err) {
      console.error("Error saving integration:", err);
      setError("Failed to save integration.");
    } finally {
      setSaving(null);
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
        >
          <JiraForm
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
        >
          <ServiceNowForm
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
        >
          <EmailForm
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
        >
          <AIForm
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

      {isOpen && <div className="mt-4 border-t border-slate-100 pt-4">{children}</div>}
    </section>
  );
}

// Jira form
function JiraForm({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: (config: Record<string, any>) => void;
}) {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [issueType, setIssueType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      baseUrl,
      email,
      apiToken,
      projectKey,
      issueType,
    });
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
        <label className="block text-[11px] font-medium text-slate-600">Jira API Token *</label>
        <input
          type="password"
          required
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
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: (config: Record<string, any>) => void;
}) {
  const [instanceUrl, setInstanceUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [table, setTable] = useState("incident");

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
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: (config: Record<string, any>) => void;
}) {
  const [provider, setProvider] = useState<"gmail" | "outlook" | "custom">("gmail");
  const [email, setEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState("Support Bot");

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
              const value = e.target.value as "gmail" | "outlook" | "custom";
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
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: (config: Record<string, any>) => void;
}) {
  const [provider, setProvider] = useState<"openai" | "groq" | "gemini">("groq");
  const [apiKey, setApiKey] = useState("");

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

