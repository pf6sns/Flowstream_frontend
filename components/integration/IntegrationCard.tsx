"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  testResult?: {
    status: "success" | "error";
    message: string;
  };
  children: React.ReactNode;
};

export function IntegrationCard({
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
          disabled={loading || testing}
          onClick={onTest}
        >
          {testing ? "Testing..." : "Test connection"}
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
