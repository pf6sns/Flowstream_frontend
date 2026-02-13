'use client'

import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Loader2, Mail, ExternalLink, Ticket, LayoutList,
    BrainCircuit, CheckCircle2, Activity, Share2,
    ArrowLeft
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
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="text-sm font-medium text-slate-500">Loading workflow…</p>
                </div>
            </div>
        )
    }

    if (!workflow) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 flex items-center justify-center p-6">
                <div className="rounded-2xl border border-slate-200/80 border-dashed bg-white p-10 text-center max-w-md">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Workflow not found</h2>
                    <p className="text-sm text-slate-500 mb-6">This workflow may have been removed or the link is incorrect.</p>
                    <Button asChild className="rounded-xl bg-brand hover:bg-brand-400 text-white">
                        <Link href="/dashboard/workflows">Back to workflows</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const { liveServiceNow, liveJira } = workflow
    const emailSubject = workflow.emailSubject || workflow.workflowData?.email?.subject || 'No subject'
    const emailFrom = workflow.emailFrom || workflow.workflowData?.email?.from || 'Unknown'
    const emailDate = workflow.createdAt || workflow.startedAt || new Date().toISOString()

    const snAssignedTo = liveServiceNow?.assigned_to || workflow.workflowData?.servicenow_assignment || 'Unassigned'
    const snStatus = liveServiceNow?.state || 'New'
    const snPriority = liveServiceNow?.priority || '3 - Moderate'

    const jiraAssignedTo = liveJira?.assignee || 'Unassigned'
    const jiraStatus = liveJira?.status || '—'
    const jiraKey = workflow.jiraTicketId || liveJira?.key

    const type = jiraKey ? 'Technical escalation' : 'Standard support'

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900 p-6 lg:p-10 font-sans">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href="/dashboard/workflows"
                            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-400 mb-3"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to workflows
                        </Link>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Workflow details
                            </h1>
                            <Badge
                                variant="secondary"
                                className={`rounded-lg text-xs font-medium ${
                                    String(snStatus).toLowerCase() === 'resolved' || String(snStatus) === '6' || String(snStatus) === '7'
                                        ? 'bg-emerald-50 text-emerald-700 border-0'
                                        : 'bg-brand-50 text-brand border-0'
                                }`}
                            >
                                {snStatus}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Started {format(new Date(emailDate), 'MMM d, yyyy · HH:mm')}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left: Input & classification */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
                            <span className="text-sm font-semibold text-slate-900">Details</span>
                            <Mail className="h-4 w-4 text-slate-400 inline-block ml-2 align-middle" />
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">From</label>
                                <p className="mt-1 text-sm font-medium text-slate-900 truncate">{emailFrom}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Subject</label>
                                <p className="mt-1 text-sm font-medium text-slate-900 leading-snug">"{emailSubject}"</p>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Type</span>
                                <Badge className="bg-brand-50 text-brand border-0 text-xs font-medium rounded-lg">
                                    {type}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80">
                            <span className="text-sm font-semibold text-slate-900">Classification</span>
                            <BrainCircuit className="h-4 w-4 text-slate-400 inline-block ml-2 align-middle" />
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Category</span>
                                <span className="font-medium text-slate-900">{type}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Priority</span>
                                <span className="font-medium text-brand">{snPriority}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Security</span>
                                <span className="font-medium text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Secure
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: ServiceNow, Jira, timeline */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ServiceNow */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 transition-shadow hover:shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-brand rounded-r" />
                            <div className="flex items-center gap-2 mb-3">
                                <Ticket className="h-4 w-4 text-brand" />
                                <span className="text-xs font-medium text-slate-500">ServiceNow</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                                {workflow.servicenowTicketId}
                            </p>
                            <p className="text-xs text-slate-500 mb-4">Incident</p>
                            <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500">Status</p>
                                    <Badge className="mt-0.5 bg-brand-50 text-brand border-0 text-xs font-medium rounded-lg">
                                        {snStatus}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Assigned to</p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">{snAssignedTo}</p>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-slate-50 hover:border-brand hover:text-brand">
                                <Link href={`/dashboard/tickets/${workflow.servicenowTicketId}`}>
                                    Open incident
                                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>

                        {/* Jira */}
                        <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 transition-shadow hover:shadow-md relative overflow-hidden ${!jiraKey ? 'opacity-60' : ''}`}>
                            {jiraKey && <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-800 rounded-r" />}
                            {!jiraKey && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl z-10">
                                    <LayoutList className="h-8 w-8 text-slate-300 mb-2" />
                                    <span className="text-xs font-medium text-slate-400">No Jira ticket</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                                <LayoutList className="h-4 w-4 text-slate-500" />
                                <span className="text-xs font-medium text-slate-500">Jira</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                                {jiraKey || '—'}
                            </p>
                            <p className="text-xs text-slate-500 mb-4">Development</p>
                            <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500">Status</p>
                                    <Badge className="mt-0.5 bg-slate-100 text-slate-700 border-0 text-xs font-medium rounded-lg">
                                        {jiraStatus}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Assigned to</p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">{jiraAssignedTo}</p>
                                </div>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full rounded-xl border-slate-200 hover:bg-slate-50"
                                disabled={!jiraKey}
                            >
                                <Link href={jiraKey ? `/dashboard/tickets/${jiraKey}` : '#'}>
                                    Open in Jira
                                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-semibold text-slate-900">Activity</span>
                        </div>
                        <div className="p-6">
                            <div className="relative border-l-2 border-slate-100 pl-6 space-y-8">
                                <div className="relative flex gap-4">
                                    <div className="absolute -left-[29px] top-0.5 h-4 w-4 rounded-full bg-brand border-2 border-white shadow-sm" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Triggered</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Request received from {emailFrom}. Validation complete.
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono">{format(new Date(emailDate), 'HH:mm:ss')}</p>
                                    </div>
                                </div>
                                <div className="relative flex gap-4">
                                    <div className="absolute -left-[29px] top-0.5 h-4 w-4 rounded-full bg-brand border-2 border-white shadow-sm" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Classified</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Routed as <strong>{type}</strong>. Priority: <strong>{snPriority}</strong>.
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono">{format(new Date(emailDate), 'HH:mm:ss')}</p>
                                    </div>
                                </div>
                                <div className="relative flex gap-4">
                                    <div className="absolute -left-[29px] top-0.5 h-4 w-4 rounded-full bg-brand border-2 border-white shadow-sm" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">ServiceNow created</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Incident <strong>{workflow.servicenowTicketId}</strong> created and linked.
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono">{format(new Date(emailDate), 'HH:mm:ss')}</p>
                                    </div>
                                </div>
                                {jiraKey && (
                                    <div className="relative flex gap-4">
                                        <div className="absolute -left-[29px] top-0.5 h-4 w-4 rounded-full bg-slate-800 border-2 border-white shadow-sm" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Jira created</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Task <strong>{jiraKey}</strong> created for development.
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 font-mono">{format(new Date(emailDate), 'HH:mm:ss')}</p>
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
