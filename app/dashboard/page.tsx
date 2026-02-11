 "use client";

import { Activity, Mail, Workflow, HeartPulse, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const stati = [
  {
    label: "Total tickets today",
    value: "24",
    delta: "+12% vs yesterday",
  },
  {
    label: "Emails processed",
    value: "87",
    delta: "Last 24 hours",
  },
  {
    label: "Active workflows",
    value: "5",
    delta: "Across Jira & ServiceNow",
  },
  {
    label: "System health",
    value: "OK",
    delta: "All services online",
  },
];

const workflowSteps = [
  { name: "Email received", status: "complete" as const },
  { name: "AI classification", status: "complete" as const },
  { name: "Ticket created", status: "active" as const },
  { name: "Jira created", status: "pending" as const },
  { name: "Status updates", status: "pending" as const },
  { name: "Resolution", status: "pending" as const },
];

const activities = [
  "Email received from john@company.com",
  "Ticket INC001234 created",
  "Jira ticket MA-123 created",
  "Ticket INC001234 resolved",
];

const integrations = [
  { name: "ServiceNow", status: "Connected", lastSync: "Just now" },
  { name: "Jira", status: "Connected", lastSync: "2 min ago" },
  { name: "Gmail", status: "Connected", lastSync: "5 min ago" },
  { name: "Groq AI", status: "Connected", lastSync: "10 min ago" },
];

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:p-8">
      {/* Top: header + quick stats */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text lg:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            High-level view of today&apos;s incident automation activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            View logs
          </Button>
          <Button size="sm">Trigger workflow check</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stati.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-text">{stat.value}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{stat.delta}</p>
              </div>
            ))}
          </div>

          {/* Live workflow visualization */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text">Live Workflow</h2>
                <p className="text-xs text-slate-500">
                  Current state for a sample incident flowing through Flowstream.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand" /> In progress
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-300" /> Pending
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Error
                </span>
              </div>
            </div>

            <div className="relative mx-auto max-w-2xl">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 h-full w-px bg-slate-200" />

              <div className="space-y-4">
                {workflowSteps.map((step, index) => {
                  const isComplete = step.status === "complete";
                  const isActive = step.status === "active";

                  const dotColor = isComplete
                    ? "bg-emerald-500"
                    : isActive
                      ? "bg-brand"
                      : "bg-slate-300";

                  return (
                    <div key={step.name} className="relative flex gap-4 pl-4">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-sm ${dotColor}`}
                        >
                          {isComplete && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                          {isActive && !isComplete && (
                            <Activity className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {index !== workflowSteps.length - 1 && (
                          <div className="mt-1 h-8 w-px bg-slate-200" />
                        )}
                      </div>
                      <div className="rounded-lg bg-slate-50 px-4 py-2">
                        <p className="text-xs font-semibold text-text">
                          {step.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Status:{" "}
                          <span
                            className={
                              isComplete
                                ? "text-emerald-600"
                                : isActive
                                  ? "text-brand"
                                  : "text-slate-500"
                            }
                          >
                            {step.status === "complete"
                              ? "Completed"
                              : step.status === "active"
                                ? "In progress"
                                : "Pending"}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Recent activity</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              {activities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: integrations + health */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Integrations</h2>
            </div>
            <div className="space-y-3 text-sm">
              {integrations.map((int) => (
                <div
                  key={int.name}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-text">{int.name}</p>
                    <p className="text-xs text-slate-500">
                      Last sync: {int.lastSync}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {int.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-text">System health</h2>
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-emerald-500" />
                <span>All background schedulers are running.</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>Gmail inbox connected and polling.</span>
              </div>
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-emerald-500" />
                <span>Last workflow completed without errors.</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>No active alerts.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
