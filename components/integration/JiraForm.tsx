"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { JiraConfig } from "./types";

type JiraFormProps = {
  initialConfig?: JiraConfig;
  saving: boolean;
  onSave: (config: JiraConfig) => void;
};

export function JiraForm({ initialConfig, saving, onSave }: JiraFormProps) {
  const [baseUrl, setBaseUrl] = useState(initialConfig?.baseUrl ?? "");
  const [email, setEmail] = useState(initialConfig?.email ?? "");
  const [apiToken, setApiToken] = useState(initialConfig?.apiToken ?? "");
  const [projectKey, setProjectKey] = useState(initialConfig?.projectKey ?? "");
  const [issueType, setIssueType] = useState(initialConfig?.issueType ?? "");
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: JiraConfig = {
      baseUrl,
      email,
      projectKey,
      issueType,
    };

    if (apiToken.trim().length > 0 && apiToken !== initialConfig?.apiToken) {
      payload.apiToken = apiToken;
    }

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <p className="text-[11px] text-slate-500">
        Connect your Jira workspace. Click the eye icon to view your saved API token.
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
            Jira API Token {initialConfig?.hasToken ? "" : "*"}
          </label>
          {initialConfig?.hasToken && (
            <div className="group relative inline-flex items-center">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-500">
                i
              </span>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-md group-hover:block">
                <p>Token is stored securely. Enter a new token only if you want to update it.</p>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            required={!initialConfig?.hasToken}
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="ATATT3x..."
            className="block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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
