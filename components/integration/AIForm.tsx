"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AIConfig, AIProvider } from "./types";

type AIFormProps = {
  initialConfig?: AIConfig;
  saving: boolean;
  onSave: (config: AIConfig) => void;
};

export function AIForm({ initialConfig, saving, onSave }: AIFormProps) {
  const [provider, setProvider] = useState<AIProvider>(initialConfig?.provider ?? "groq");
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey ?? "");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apiKeyToSend = apiKey === initialConfig?.apiKey ? "" : apiKey;

    onSave({ provider, apiKey: apiKeyToSend });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">AI Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as AIProvider)}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-black focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="openai">OpenAI</option>
          <option value="groq">Groq</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <label className="block text-[11px] font-medium text-slate-600">
            API Key {initialConfig?.hasApiKey ? "" : "*"}
          </label>
          {initialConfig?.hasApiKey && (
            <div className="group relative inline-flex items-center">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[10px] font-semibold text-slate-500">
                i
              </span>
              <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-md group-hover:block">
                <p>API key is stored securely. Enter a new key only if you want to update it.</p>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            required={!initialConfig?.hasApiKey}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-xs text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={-1}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="pt-1">
        <Button type="submit" size="sm" disabled={saving} className="text-xs">
          {saving ? "Saving…" : "Save AI settings"}
        </Button>
      </div>
    </form>
  );
}
