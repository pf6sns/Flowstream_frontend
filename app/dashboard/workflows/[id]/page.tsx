'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import {
    Loader2, Mail, ExternalLink, Ticket, LayoutList,
    User, BrainCircuit, ArrowRight, CheckCircle2,
    ChevronRight, Activity, Clock, Zap, ShieldCheck,
    FileText, Database, Share2, CornerUpLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export default function WorkflowDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [workflow, setWorkflow] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchWorkflow = useCallback(async () => {
        try {
            const res = await fetch(`/api/workflows/${id}`)
            if (res.ok) {
                const data = await res.json()
                setWorkflow(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchWorkflow()
    }, [fetchWorkflow])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Audit Trail...</span>
                </div>
            </div>
        )
    }

    if (!workflow) {
        return (
            <div className="flex h-screen items-center justify-center bg-white p-6">
                <div className="text-center border border-slate-200 border-dashed p-12 max-w-md">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 mb-2">Record Identifier Missing</h2>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6 italic">The requested system identifier does not exist in the master registry.</p>
                    <Button asChild className="bg-brand hover:bg-brand-400 rounded-none h-9 px-6 font-bold uppercase text-[10px] tracking-widest">
                        <Link href="/dashboard/workflows">Return to Registry</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const { liveServiceNow, liveJira } = workflow;
    const emailSubject = workflow.emailSubject || workflow.workflowData?.email?.subject || 'NO_SUBJECT_STR';
    const emailFrom = workflow.emailFrom || workflow.workflowData?.email?.from || 'UNKNOWN_ORIGIN';
    const emailDate = workflow.createdAt || workflow.startedAt || new Date().toISOString();

    const snAssignedTo = liveServiceNow?.assigned_to || workflow.workflowData?.servicenow_assignment || 'PENDING_ASSIGNMENT';
    const snStatus = liveServiceNow?.state || 'NEW';
    const snPriority = liveServiceNow?.priority || '3 - Moderate';

    const jiraAssignedTo = liveJira?.assignee || 'UNASSIGNED_DEV';
    const jiraStatus = liveJira?.status || 'IDLE';
    const jiraKey = workflow.jiraTicketId || liveJira?.key;

    const type = jiraKey ? 'TECHNICAL_ESCALATION' : 'STANDARD_SUPPORT';

    return (
        <div className="flex-1 space-y-6 p-6 bg-slate-50 min-h-screen text-[#242424]">
            {/* SUB-HEADER NAV */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/dashboard/workflows" className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1 uppercase tracking-widest bg-white px-2 py-1 border border-slate-200">
                            <CornerUpLeft className="h-3 w-3" />
                            Return
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Workflow: {id.substring(0, 12)}</h2>
                        <Badge variant="outline" className={`h-6 rounded-none font-bold text-[10px] border-2 uppercase ${snStatus.toLowerCase() === 'resolved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-brand-50 text-brand-600'}`}>
                            {snStatus}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white border border-slate-200 text-right">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Started At (ISO)</div>
                        <div className="text-[11px] font-mono font-bold text-slate-700 uppercase">{format(new Date(emailDate), 'yyyy-MM-dd HH:mm:ss')}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* LEFT PANEL: SPECIFICATIONS */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
                        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest">Input Parameters</span>
                            <Mail className="h-4 w-4 opacity-50" />
                        </div>
                        <div className="p-4 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Origin Channel</label>
                                <div className="text-xs font-bold bg-slate-50 p-3 border border-slate-100 uppercase tracking-tight text-slate-700 truncate">
                                    {emailFrom}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Object Identifier</label>
                                <div className="text-xs font-bold bg-slate-50 p-3 border border-slate-100 text-slate-700 leading-snug">
                                    "{emailSubject}"
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-brand uppercase tracking-tighter">System Logic</span>
                                <Badge className="bg-brand-50 text-brand-600 rounded-none border-brand-100 font-black text-[9px] uppercase">{type}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
                        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Reasoning Node</span>
                            <BrainCircuit className="h-4 w-4 opacity-50" />
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                                <span className="text-slate-400 font-bold uppercase text-[9px]">Classification</span>
                                <span className="font-bold text-slate-700 uppercase tracking-tighter">{type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                                <span className="text-slate-400 font-bold uppercase text-[9px]">Calculated Priority</span>
                                <span className="font-bold text-brand uppercase tracking-tighter">{snPriority}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase text-[9px]">Security Probe</span>
                                <span className="font-bold text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    PII_SECURE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: EXECUTION AUDIT */}
                <div className="xl:col-span-8 space-y-6">

                    {/* SYSTEM CONNECTIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SERVICENOW DATA POINT */}
                        <div className="bg-white border border-slate-200 shadow-sm rounded-none p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-2 h-full bg-brand" />
                            <div className="flex items-center gap-2 mb-4">
                                <Ticket className="h-4 w-4 text-brand" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ServiceNow Module</span>
                            </div>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 font-mono">
                                {workflow.servicenowTicketId}
                            </h4>
                            <div className="text-[10px] font-bold text-brand uppercase tracking-widest mb-6">Incident_Master_Record</div>

                            <div className="grid grid-cols-2 gap-4 mb-6 border-t border-slate-50 pt-4">
                                <div>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">State_Flag</div>
                                    <Badge variant="outline" className="rounded-none border-brand-200 bg-brand-50 text-brand-600 font-bold text-[10px] uppercase">{snStatus}</Badge>
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</div>
                                    <div className="text-xs font-bold text-slate-700 truncate">{snAssignedTo}</div>
                                </div>
                            </div>

                            <Button asChild className="w-full bg-white border border-slate-200 hover:border-brand text-brand rounded-none text-[10px] font-bold uppercase transition-all">
                                <Link href={`/dashboard/tickets/${workflow.servicenowTicketId}`}>
                                    Open Incident Interface
                                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>

                        {/* JIRA DATA POINT */}
                        <div className={`bg-white border border-slate-200 shadow-sm rounded-none p-5 relative overflow-hidden group ${!jiraKey ? 'opacity-40 grayscale' : ''}`}>
                            {jiraKey && <div className="absolute top-0 right-0 w-2 h-full bg-slate-900" />}
                            {!jiraKey && <div className="absolute inset-0 z-10 bg-white/50 flex flex-col items-center justify-center">
                                <ShieldCheck className="h-8 w-8 text-slate-200 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node_Not_Required</span>
                            </div>}

                            <div className="flex items-center gap-2 mb-4">
                                <LayoutList className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jira Project Node</span>
                            </div>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 font-mono">
                                {jiraKey || 'VOID'}
                            </h4>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Development_Track</div>

                            <div className="grid grid-cols-2 gap-4 mb-6 border-t border-slate-50 pt-4">
                                <div>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Process_State</div>
                                    <Badge variant="outline" className="rounded-none border-slate-200 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase">{jiraStatus}</Badge>
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Resource</div>
                                    <div className="text-xs font-bold text-slate-700 truncate">{jiraAssignedTo}</div>
                                </div>
                            </div>

                            <Button asChild className="w-full bg-white border border-slate-200 hover:border-slate-900 text-slate-900 rounded-none text-[10px] font-bold uppercase transition-all" disabled={!jiraKey}>
                                <Link href={jiraKey ? `/dashboard/tickets/${jiraKey}` : '#'}>
                                    Open Dev Environment
                                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* EXECUTION TIMELINE (AUDIT) */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-none">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Master Audit History</span>
                            <Activity className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="p-6">
                            <div className="relative border-l-2 border-slate-100 pl-8 space-y-10 pb-4">

                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 h-5 w-5 bg-white border-2 border-brand rounded-full flex items-center justify-center z-10">
                                        <Mail className="h-2.5 w-2.5 text-brand" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-black uppercase tracking-tight text-slate-900">Protocol Triggered</p>
                                            <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(emailDate), 'HH:mm:ss.SSS')}</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500 leading-normal">System initialized. Primary signal received from <span className="text-brand font-bold">{emailFrom}</span>. Packet validation complete.</p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 h-5 w-5 bg-white border-2 border-brand rounded-full flex items-center justify-center z-10">
                                        <BrainCircuit className="h-2.5 w-2.5 text-brand" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-black uppercase tracking-tight text-slate-900">Reasoning Engine Exit</p>
                                            <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(emailDate), 'HH:mm:ss.SSS')}</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500 leading-normal">AI routing node confirmed <strong>{type}</strong>. Sentiment calculated. Priority set to <strong>{snPriority}</strong>.</p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-[41px] top-1 h-5 w-5 bg-white border-2 border-brand rounded-full flex items-center justify-center z-10">
                                        <Ticket className="h-2.5 w-2.5 text-brand" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-black uppercase tracking-tight text-slate-900">Incident Registry Link</p>
                                            <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(emailDate), 'HH:mm:ss.SSS')}</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500 leading-normal">ServiceNow record <strong>{workflow.servicenowTicketId}</strong> created successfully. Integration handshake complete.</p>
                                    </div>
                                </div>

                                {jiraKey && (
                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-1 h-5 w-5 bg-slate-900 rounded-full flex items-center justify-center z-10">
                                            <Share2 className="h-2.5 w-2.5 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-black uppercase tracking-tight text-slate-900">Cross-Platform Propagation</p>
                                                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(emailDate), 'HH:mm:ss.SSS')}</span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-500 leading-normal">Task escalated to Jira Development. ID: <strong>{jiraKey}</strong>. Peer monitoring active.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
