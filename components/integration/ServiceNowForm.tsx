"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ServiceNowConfig } from "./types";

type ServiceNowFormProps = {
  initialConfig?: ServiceNowConfig;
  saving: boolean;
  onSave: (config: ServiceNowConfig) => void;
};

export function ServiceNowForm({ initialConfig, saving, onSave }: ServiceNowFormProps) {
  const [instanceUrl, setInstanceUrl] = useState(initialConfig?.instanceUrl ?? "");
  const [username, setUsername] = useState(initialConfig?.username ?? "");
  const [password, setPassword] = useState(initialConfig?.password ?? "");
  const [table, setTable] = useState(initialConfig?.table ?? "incident");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordToSend = password === initialConfig?.password ? "" : password;

    onSave({
      instanceUrl,
      username,
      password: passwordToSend,
      table,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">Instance URL *</label>
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
        <div className="flex items-center gap-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Password / API token {initialConfig?.hasPassword ? "" : "*"}
          </label>
          {initialConfig?.hasPassword && (
            <div className="group relative inline-flex items-center">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-500">
                i
              </span>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-md group-hover:block">
                <p>Password is stored securely. Enter a new password only if you want to update it.</p>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required={!initialConfig?.hasPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">Table (optional)</label>
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
