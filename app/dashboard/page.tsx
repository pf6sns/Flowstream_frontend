"use client";

import {
  Activity,
  Loader2,
  Zap,
  RefreshCw,
  LayoutDashboard,
  CheckCircle,
  FileText,
  Briefcase,
  TrendingUp,
  BarChart3,
  Shield,
  PlugZap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("today");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = useCallback(async (currentRange: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/stats?range=${currentRange}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(range);
    const interval = setInterval(() => fetchDashboardData(range), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, range]);

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <span className="text-sm font-medium text-slate-500">
            Loading dashboard…
          </span>
        </div>
      </div>
    );
  }

  const { stats, integrations, recentActivity, liveWorkflow } = data || {};

  const mainStats = [
    {
      label: "Resolved",
      value: stats?.globalResolved ?? 0,
      sub: "vs last period",
      icon: CheckCircle,
      highlight: true,
      delta: "+12%",
      deltaPositive: true,
    },
    {
      label: "In progress",
      value: stats?.globalInProgress ?? 0,
      sub: "Active",
      icon: TrendingUp,
      highlight: false,
      delta: "Stable",
      deltaPositive: null,
    },
    {
      label: "Total volume",
      value: stats?.total ?? 0,
      sub: "Tickets",
      icon: FileText,
      highlight: false,
      delta: range.charAt(0).toUpperCase() + range.slice(1),
      deltaPositive: null,
    },
    {
      label: "AI confidence",
      value: "98.2%",
      sub: "Optimal",
      icon: Zap,
      highlight: false,
      delta: "Optimal",
      deltaPositive: true,
    },
  ];

  const workflowSteps =
    liveWorkflow?.workflowData?.steps ?? [
      { name: "System standby — monitoring", status: "pending" },
    ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900 p-6 lg:p-10 font-sans">
      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {format(new Date(), "EEEE, MMMM d, yyyy")} · Synced{" "}
              {format(lastUpdated, "HH:mm:ss")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={range} onValueChange={setRange} className="w-auto">
              <TabsList className="inline-flex h-10 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm gap-0.5 text-slate-900 transition-colors duration-200">
                {["today", "week", "month", "year"].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="
                    rounded-lg px-4 py-2 text-sm font-medium
                    transition-all duration-200 ease-out
                    bg-white text-slate-700
                    data-[state=active]:bg-[#2b7fff]
                    data-[state=active]:text-white
                    data-[state=active]:shadow-sm
                    hover:bg-slate-100
                  "
                >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              onClick={() => fetchDashboardData(range)}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 h-10 px-4"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Sync
            </Button>
          </div>
        </div>
      </header>

      {/* Stats cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-10">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg ${
                stat.highlight
                  ? "dashboard-card-gradient shadow-lg text-white"
                  : "border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:border-slate-200"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-xl p-2.5 ${
                      stat.highlight ? "bg-white/20" : "bg-brand-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        stat.highlight ? "text-white" : "text-brand"
                      }`}
                    />
                  </div>
                  {stat.delta && (
                    <Badge
                      variant="secondary"
                      className={
                        stat.deltaPositive === true
                          ? "bg-emerald-50 text-emerald-700 border-0 text-xs font-medium"
                          : stat.deltaPositive === false
                            ? "bg-red-50 text-red-600 border-0 text-xs font-medium"
                            : stat.highlight
                              ? "bg-white/25 text-white border-0 text-xs font-medium"
                              : "bg-slate-100 text-slate-600 border-0 text-xs font-medium"
                      }
                    >
                      {stat.delta}
                    </Badge>
                  )}
                </div>
                <p
                  className={`mt-5 text-3xl font-bold tracking-tight ${
                    stat.highlight ? "text-white" : "text-slate-900"
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    stat.highlight ? "text-white/95" : "text-slate-600"
                  }`}
                >
                  {stat.label}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    stat.highlight ? "text-white/75" : "text-slate-400"
                  }`}
                >
                  {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ServiceNow, Jira, Pipeline */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {/* ServiceNow */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-brand" />
              <h2 className="text-sm font-semibold text-slate-900">
                ServiceNow
              </h2>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs font-medium">
              Synced
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Total",
                value: stats?.servicenow?.total ?? 0,
                valueClass: "text-slate-900",
              },
              {
                label: "Resolved",
                value: stats?.servicenow?.resolved ?? 0,
                valueClass: "text-emerald-600",
              },
              {
                label: "In progress",
                value: stats?.servicenow?.inProgress ?? 0,
                valueClass: "text-brand",
              },
              {
                label: "Closed",
                value: stats?.servicenow?.closed ?? 0,
                valueClass: "text-slate-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-slate-50/80 p-3 border border-slate-100"
              >
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p
                  className={`text-lg font-semibold tracking-tight ${item.valueClass}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Jira */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-brand-400" />
              <h2 className="text-sm font-semibold text-slate-900">
                Jira Cloud
              </h2>
            </div>
            <Badge className="bg-brand-50 text-brand border-0 text-xs font-medium">
              Active
            </Badge>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "To do",
                value: stats?.jira?.todo ?? 0,
                bar: "bg-slate-200",
              },
              {
                label: "In progress",
                value: stats?.jira?.inProgress ?? 0,
                bar: "bg-brand-200",
              },
              {
                label: "Done",
                value: stats?.jira?.done ?? 0,
                bar: "bg-emerald-200",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2.5 border border-slate-100"
              >
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
                <div className={`h-1.5 w-12 rounded-full ${item.bar}`} />
              </div>
            ))}
            <div className="rounded-lg bg-brand-50/80 border border-brand-100 px-3 py-2.5 flex items-center justify-between mt-2">
              <div>
                <p className="text-xs font-medium text-brand">Platform total</p>
                <p className="text-base font-semibold text-slate-900">
                  {stats?.jira?.total ?? 0}
                </p>
              </div>
              <Briefcase className="h-4 w-4 text-brand/50" />
            </div>
          </div>
        </div>

        {/* Live pipeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-400">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            Live logic flow
          </h2>
          <div className="space-y-2.5">
            {workflowSteps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg bg-slate-50/80 px-3 py-2.5 border border-slate-100"
              >
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    step.status === "completed"
                      ? "bg-emerald-500"
                      : step.status === "active"
                        ? "bg-brand animate-pulse"
                        : "bg-slate-300"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {step.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {step.status === "completed" ? "Done" : "Ready"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry + Integrations */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            Activity
          </h2>
          <div className="space-y-1">
            {recentActivity?.length ? (
              recentActivity.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-50/80 transition-colors"
                >
                  <span className="font-mono text-xs text-slate-400 shrink-0">
                    {format(new Date(log.createdAt), "HH:mm:ss")}
                  </span>
                  <span className="text-slate-600 truncate">{log.description}</span>
                  <Badge className="ml-auto bg-slate-100 text-slate-500 border-0 text-xs font-normal">
                    Info
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4">No recent activity.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <PlugZap className="h-4 w-4 text-emerald-500" />
            Integrations
          </h2>
          <div className="space-y-3">
            {integrations?.map((int: any) => (
              <div
                key={int.integrationType}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-slate-50/80 border border-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {int.integrationType}
                  </p>
                  <p className="text-xs text-slate-500">Connected</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      int.status === "connected"
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-600">
                    {int.status === "connected" ? "Active" : "Offline"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-slate-50/80 border border-slate-100 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand" />
              <span className="text-xs font-medium text-slate-600">
                TLS 1.3
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-slate-500 hover:text-slate-700"
            asChild
          >
            <Link href="/dashboard/integrations">View all</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
