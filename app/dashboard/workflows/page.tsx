'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    Search, RefreshCw, ChevronRight, ChevronLeft,
    Clock, CheckCircle2, AlertCircle, Loader2,
    Inbox, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [lastSynced, setLastSynced] = useState<Date | null>(null)

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(8)
    const [totalWorkflows, setTotalWorkflows] = useState(0)

    const fetchWorkflows = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (searchTerm) params.append('search', searchTerm)
            params.append('limit', pageSize.toString())
            params.append('skip', ((page - 1) * pageSize).toString())

            const res = await fetch(`/api/workflows?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setWorkflows(data.workflows)
                setTotalWorkflows(data.total)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load workflows')
        } finally {
            setLoading(false)
        }
    }, [statusFilter, searchTerm, page, pageSize])

    const handleSync = async () => {
        setSyncing(true)
        const tid = toast.loading('Syncing workflows...')
        try {
            await fetch('/api/sync/emails', { method: 'POST' })
            await fetch('/api/sync/servicenow', { method: 'POST' })

            toast.success('Sync complete', { id: tid })
            setLastSynced(new Date())
            fetchWorkflows()
        } catch (error) {
            toast.error('Sync failed', { id: tid })
        } finally {
            setSyncing(false)
        }
    }

    useEffect(() => {
        fetchWorkflows()
    }, [fetchWorkflows])

    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && !syncing) {
                const params = new URLSearchParams()
                if (statusFilter !== 'all') params.append('status', statusFilter)
                if (searchTerm) params.append('search', searchTerm)
                params.append('limit', pageSize.toString())
                params.append('skip', ((page - 1) * pageSize).toString())

                fetch(`/api/workflows?${params.toString()}`)
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data) {
                            setWorkflows(data.workflows)
                            setTotalWorkflows(data.total)
                        }
                    })
                    .catch(() => {})
            }
        }, 10000)
        return () => clearInterval(interval)
    }, [statusFilter, searchTerm, page, pageSize, loading, syncing])

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'completed' || s === 'resolved' || s === 'closed' || s === '6' || s === '7' || s === 'done')
            return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        if (s === 'processing' || s === 'in progress' || s === 'new' || s === '1' || s === '2')
            return <Clock className="h-3.5 w-3.5 text-brand animate-spin shrink-0" />
        return <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
    }

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            '1': 'New',
            '2': 'In progress',
            '3': 'On hold',
            '6': 'Resolved',
            '7': 'Closed',
            '8': 'Canceled'
        }
        return map[status] || (status || 'Unknown')
    }

    const totalPages = Math.ceil(totalWorkflows / pageSize)
    const startRecord = totalWorkflows === 0 ? 0 : (page - 1) * pageSize + 1
    const endRecord = Math.min(page * pageSize, totalWorkflows)

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900 p-6 lg:p-10 font-sans">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Workflow Registry
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {totalWorkflows} workflow{totalWorkflows !== 1 ? 's' : ''} · Auto-refresh every 10s
                            {lastSynced && (
                                <> · Last synced {format(lastSynced, 'HH:mm:ss')}</>
                            )}
                        </p>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="rounded-xl bg-brand hover:bg-brand-400 text-white shadow-sm h-10 px-4 transition-all"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>
                </div>
            </header>

            {/* Filters */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by subject or ticket ID..."
                            className="pl-10 h-10 bg-slate-50/80 border-slate-200 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-brand"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl border-slate-200 bg-white text-sm">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[100px] h-10 rounded-xl border-slate-200 bg-white text-sm">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="8">8 per page</SelectItem>
                                <SelectItem value="16">16 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading && workflows.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col items-center justify-center min-h-[320px]">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="mt-4 text-sm font-medium text-slate-500">Loading workflows…</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {workflows.length > 0 ? workflows.map((workflow) => (
                            <Link
                                href={`/dashboard/workflows/${workflow._id}`}
                                key={workflow._id}
                                className="group block"
                            >
                                <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-200">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <Badge
                                            variant="secondary"
                                            className="inline-flex items-center gap-1.5 rounded-lg border-0 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5"
                                        >
                                            {getStatusIcon(workflow.status)}
                                            {formatStatus(workflow.status)}
                                        </Badge>
                                        <span className="text-xs text-slate-400 shrink-0">
                                            {format(new Date(workflow.startedAt || workflow.createdAt), 'dd MMM · HH:mm')}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-4 group-hover:text-brand transition-colors">
                                        {workflow.emailSubject || 'Untitled'}
                                    </h3>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 border border-slate-100">
                                            <span className="text-xs font-medium text-slate-500">ServiceNow</span>
                                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px] font-mono">
                                                {workflow.servicenowTicketId || '—'}
                                            </span>
                                        </div>
                                        {workflow.jiraTicketId && (
                                            <div className="flex items-center justify-between rounded-lg bg-brand-50/80 px-3 py-2 border border-brand-100">
                                                <span className="text-xs font-medium text-brand">Jira</span>
                                                <span className="text-xs font-semibold text-brand truncate max-w-[120px] font-mono">
                                                    {workflow.jiraTicketId}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-brand transition-colors">
                                        <span>View details</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full rounded-2xl border border-slate-200/80 border-dashed bg-white py-16 flex flex-col items-center justify-center">
                                <Inbox className="h-12 w-12 text-slate-200 mb-3" />
                                <p className="text-sm font-medium text-slate-500">No workflows found</p>
                                <p className="text-xs text-slate-400 mt-1">Try adjusting filters or run a sync</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalWorkflows > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Showing {startRecord}–{endRecord} of {totalWorkflows}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1 || loading}
                                    className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium text-slate-600 min-w-[4rem] text-center">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages || loading}
                                    className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-slate-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
