"use client";

import {
  Activity, Loader2, Zap, Shield, RefreshCw, Terminal, LayoutDashboard, CheckCircle, FileText, Briefcase, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow, format } from "date-fns";
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
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#0065ff]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  const { stats, integrations, recentActivity, liveWorkflow } = data || {};

  const mainStats = [
    {
      label: "Global Resolved",
      value: stats?.globalResolved || 0,
      sub: "Completed Tasks",
      icon: <CheckCircle className="h-4 w-4 text-white" />,
      color: "bg-emerald-500",
      delta: "+12%"
    },
    {
      label: "In Progress",
      value: stats?.globalInProgress || 0,
      sub: "Active Engineering",
      icon: <TrendingUp className="h-4 w-4 text-white" />,
      color: "bg-[#0065ff]",
      delta: "Stable"
    },
    {
      label: "Volume",
      value: stats?.total || 0,
      sub: "Tickets Identified",
      icon: <FileText className="h-4 w-4 text-white" />,
      color: "bg-indigo-500",
      delta: range.toUpperCase()
    },
    {
      label: "AI Accuracy",
      value: "98.2%",
      sub: "Confidence Level",
      icon: <Zap className="h-4 w-4 text-white" />,
      color: "bg-amber-500",
      delta: "Optimal"
    },
  ];

  const workflowSteps = liveWorkflow?.workflowData?.steps || [
    { name: "System Standby - Monitoring Sockets", status: "pending" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 lg:p-10 font-sans">
      {/* HUD HEADER */}
      <header className="flex flex-col gap-6 mb-8 border-b border-slate-200 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#0065ff] p-2.5 rounded-sm shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Ops Dashboard</h1>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-none text-[9px] font-black uppercase">Active Hub</Badge>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Data Sync: {format(lastUpdated, 'HH:mm:ss')} • Zone: UTC+5:30
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Tabs value={range} onValueChange={setRange} className="bg-white border border-slate-200 p-1 rounded-sm shadow-sm">
              <TabsList className="bg-transparent h-8 gap-1">
                {['today', 'week', 'month', 'year'].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="text-[10px] font-black uppercase tracking-widest h-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-none shadow-none px-4"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              onClick={() => fetchDashboardData(range)}
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-sm h-10 px-6 font-black text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              RE-SYNC
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {/* TOP STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {mainStats.map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className={`${stat.color} p-2 rounded-sm shadow-md`}>
                    {stat.icon}
                  </div>
                  <span className="text-[8px] font-black text-slate-400 border border-slate-100 px-1.5 py-0.5 uppercase tracking-widest bg-slate-50">
                    {stat.delta}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tighter">{stat.value}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">{stat.sub}</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-50 group-hover:bg-[#0065ff]/10 transition-colors" />
            </div>
          ))}
        </div>

        {/* MIDDLE SECTION - PLATFORM SPECIFICS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* SERVICENOW PANEL */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-none flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-[#0065ff]" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">ServiceNow</h2>
              </div>
              <Badge className="bg-slate-900 text-white text-[8px] rounded-none px-2">INSTANCE_SYNCED</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="p-4 bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Total</p>
                <p className="text-2xl font-black tracking-tighter">{stats?.servicenow?.total || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Resolved</p>
                <p className="text-2xl font-black tracking-tighter text-emerald-600">{stats?.servicenow?.resolved || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Progressed</p>
                <p className="text-2xl font-black tracking-tighter text-[#0065ff]">{stats?.servicenow?.inProgress || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Closed</p>
                <p className="text-2xl font-black tracking-tighter text-slate-500">{stats?.servicenow?.closed || 0}</p>
              </div>
            </div>
          </div>

          {/* JIRA PANEL */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-none flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-indigo-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Jira Cloud</h2>
              </div>
              <Badge className="bg-slate-900 text-white text-[8px] rounded-none px-2">CLOUD_ACTIVE</Badge>
            </div>
            <div className="grid gap-3 flex-1">
              <div className="p-3 bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:bg-slate-100/50">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-wider">To Do</p>
                  <p className="text-xl font-black tracking-tighter text-slate-600">{stats?.jira?.todo || 0}</p>
                </div>
                <div className="w-8 h-1 bg-slate-200" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:bg-slate-100/50">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-wider">In Progress</p>
                  <p className="text-xl font-black tracking-tighter text-indigo-600">{stats?.jira?.inProgress || 0}</p>
                </div>
                <div className="w-8 h-1 bg-indigo-200" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:bg-slate-100/50">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-wider">Done</p>
                  <p className="text-xl font-black tracking-tighter text-emerald-600">{stats?.jira?.done || 0}</p>
                </div>
                <div className="w-8 h-1 bg-emerald-200" />
              </div>
              <div className="mt-1 p-3 bg-[#0065ff]/5 border border-[#0065ff]/10 flex justify-between items-center">
                <div>
                  <p className="text-[8px] font-black text-[#0065ff] uppercase mb-0.5 tracking-wider">Platform Total</p>
                  <p className="text-xl font-black tracking-tighter">{stats?.jira?.total || 0}</p>
                </div>
                <Briefcase className="h-4 w-4 text-[#0065ff]/30" />
              </div>
            </div>
          </div>

          {/* PIPELINE PANEL */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-none border-l-4 border-l-amber-400">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Live Logic Flow
            </h2>
            <div className="space-y-3">
              {workflowSteps.map((step: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-3 bg-slate-50 border border-slate-100">
                  <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${step.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : step.status === 'active' ? 'bg-[#0065ff] animate-pulse' : 'bg-slate-300'}`} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tight">{step.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{step.status === 'completed' ? 'Success' : 'Ready'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - LOGS & INTEGRATIONS */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-400" />
              Operational Telemetry
            </h2>
            <div className="space-y-2 font-mono">
              {recentActivity?.map((log: any, idx: number) => (
                <div key={idx} className="text-[10px] py-2 border-b border-slate-50 flex gap-4 hover:bg-slate-50 px-2 transition-colors">
                  <span className="text-slate-400 font-bold shrink-0">[{format(new Date(log.createdAt), 'HH:mm:ss')}]</span>
                  <span className="text-slate-600 truncate">{log.description}</span>
                  <span className="ml-auto text-[8px] font-black bg-slate-100 px-1 py-0.5 rounded-none text-slate-400">INFO</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-500" />
              Adapters
            </h2>
            <div className="space-y-4 pt-4">
              {integrations?.map((int: any) => (
                <div key={int.integrationType} className="flex items-center justify-between pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase">{int.integrationType}</p>
                    <p className="text-[8px] text-slate-400 font-bold tracking-widest">STABLE_CONNECTION</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-none ${int.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[9px] font-black uppercase text-slate-600">{int.status === 'connected' ? 'Active' : 'Offline'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6">
              <div className="flex bg-slate-50 p-4 border border-slate-100 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#0065ff]" />
                  <span className="text-[9px] font-black uppercase tracking-widest">TLS 1.3 Active</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <Button variant="ghost" className="w-full mt-4 text-[9px] font-black text-slate-400 border border-slate-100 rounded-none h-8 tracking-[0.2em]">VIEW ALL CONFIGS</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
