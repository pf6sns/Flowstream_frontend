"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EmailConfig, EmailProvider } from "./types";

type EmailFormProps = {
  initialConfig?: EmailConfig;
  saving: boolean;
  onSave: (config: EmailConfig) => void;
};

export function EmailForm({ initialConfig, saving, onSave }: EmailFormProps) {
  const persistedEmail = initialConfig?.fromEmail || initialConfig?.username || "";
  const [provider, setProvider] = useState<EmailProvider>(initialConfig?.provider ?? "gmail");
  const [email, setEmail] = useState(persistedEmail);
  const [smtpHost, setSmtpHost] = useState(initialConfig?.smtpHost ?? "smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(initialConfig?.smtpPort ?? 587);
  const [password, setPassword] = useState(initialConfig?.password ?? "");
  const [fromName, setFromName] = useState(initialConfig?.fromName ?? "Support Bot");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordToSend = password === initialConfig?.password ? "" : password;

    onSave({
      provider,
      smtpHost,
      smtpPort,
      username: email,
      password: passwordToSend,
      fromEmail: email,
      fromName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">Email address *</label>
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
          <label className="block text-[11px] font-medium text-slate-600">SMTP Provider *</label>
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
          <div className="flex items-center gap-1">
            <label className="block text-[11px] font-medium text-slate-600">
              App Password {initialConfig?.hasPassword ? "" : "*"}
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
              placeholder="•••• •••• •••• ••••"
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
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">SMTP Server *</label>
          <input
            type="text"
            required
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-600">Port *</label>
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
        <label className="block text-[11px] font-medium text-slate-600">From name</label>
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
