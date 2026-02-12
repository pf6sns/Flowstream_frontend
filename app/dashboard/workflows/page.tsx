'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    Search, RefreshCw, Mail, Ticket, Code,
    ChevronRight, ChevronLeft, Filter,
    Clock, CheckCircle2, AlertCircle, Loader2,
    Activity, Inbox, Layers, Terminal, ArrowRight
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
            toast.error('System data retrieval error')
        } finally {
            setLoading(false)
        }
    }, [statusFilter, searchTerm, page, pageSize])

    const handleSync = async () => {
        setSyncing(true)
        const tid = toast.loading('Executing system synchronization...')
        try {
            await fetch('/api/sync/emails', { method: 'POST' })
            await fetch('/api/sync/servicenow', { method: 'POST' })

            toast.success('Synchronization successful', { id: tid })
            setLastSynced(new Date())
            fetchWorkflows()
        } catch (error) {
            toast.error('Sync execution failed', { id: tid })
        } finally {
            setSyncing(false)
        }
    }

    useEffect(() => {
        fetchWorkflows()
    }, [fetchWorkflows])

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'completed') return <CheckCircle2 className="h-3 w-3 mr-1.5 text-emerald-600" />
        if (s === 'processing') return <Clock className="h-3 w-3 mr-1.5 text-brand animate-spin" />
        return <AlertCircle className="h-3 w-3 mr-1.5 text-slate-400" />
    }

    const totalPages = Math.ceil(totalWorkflows / pageSize)

    return (
        <div className="flex-1 space-y-4 p-6 bg-slate-50 min-h-screen text-[#242424]">
            {/* COMPACT REGISTRY HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0065ff] px-2 py-1.5 rounded-sm">
                        <Terminal className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-tight">Workflow Registry</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-none border-slate-300 font-bold bg-white">
                                NODES: 04
                            </Badge>
                            <span className="text-slate-400 text-[10px] font-bold uppercase">System: Operational</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Synchronizer</div>
                        {lastSynced && (
                            <div className="text-[11px] font-mono text-slate-600">
                                {format(lastSynced, 'yyyy-MM-dd HH:mm:ss')}
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-[#0065ff] hover:bg-[#0047b3] text-white rounded-sm h-9 px-4 font-bold text-xs shadow-sm"
                    >
                        <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                        EXECUTE SYNC
                    </Button>
                </div>
            </div>

            {/* MINIMALIST FILTER STRIP */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white border border-slate-200 p-2 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        placeholder="Filter by Subject / ID..."
                        className="pl-8 h-8 bg-slate-50 border-slate-200 rounded-sm text-xs font-medium focus-visible:ring-1 focus-visible:ring-brand"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-[130px] h-8 bg-white border-slate-200 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="all">Global States</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-[90px] h-8 bg-white border-slate-200 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            <SelectValue placeholder="Limit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="8">08 ROWS</SelectItem>
                            <SelectItem value="16">16 ROWS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* DATA GRID */}
            {loading && workflows.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-[300px] border border-slate-200 bg-white">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-4 tracking-[0.2em]">Querying Database...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {workflows.length > 0 ? workflows.map((workflow) => (
                            <Link href={`/dashboard/workflows/${workflow._id}`} key={workflow._id} className="group">
                                <div className="bg-white border border-slate-200 rounded-sm p-4 h-full flex flex-col hover:border-brand transition-colors relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            {getStatusIcon(workflow.status)}
                                            {workflow.status}
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-50 px-1 py-0.5 border border-slate-100 uppercase">
                                            {format(new Date(workflow.startedAt || workflow.createdAt), 'dd.MM - HH:mm')}
                                        </span>
                                    </div>

                                    <h3 className="text-xs font-bold text-[#242424] leading-snug line-clamp-2 min-h-[2.5rem] mb-4 group-hover:text-brand transition-colors">
                                        {workflow.emailSubject || 'UNTITLED_RECORD'}
                                    </h3>

                                    <div className="mt-auto space-y-1.5">
                                        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border border-slate-100">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ServiceNow</span>
                                            <span className="text-[10px] font-mono font-bold text-slate-600 truncate max-w-[100px]">
                                                {workflow.servicenowTicketId || 'PENDING'}
                                            </span>
                                        </div>

                                        {workflow.jiraTicketId && (
                                            <div className="flex items-center justify-between px-2 py-1.5 bg-brand-50 border border-brand-100">
                                                <span className="text-[8px] font-black text-brand-400 uppercase tracking-widest">Jira_Task</span>
                                                <span className="text-[10px] font-mono font-bold text-brand-600">
                                                    {workflow.jiraTicketId}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter text-slate-400 group-hover:text-brand transition-colors">
                                        <span>SYSTEM ACTION</span>
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed">
                                <Inbox className="h-8 w-8 text-slate-200 mb-2" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NULL Set Returned</span>
                            </div>
                        )}
                    </div>

                    {/* REGISTRY PAGINATION */}
                    {totalWorkflows > 0 && (
                        <div className="flex items-center justify-between bg-white border border-slate-200 p-2 shadow-sm">
                            <div className="text-[9px] font-bold text-slate-400 px-4 uppercase tracking-[0.2em]">
                                RECORD SET: {Math.min(totalWorkflows, (page - 1) * pageSize + 1)}-{Math.min(page * pageSize, totalWorkflows)} / {totalWorkflows}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1 || loading}
                                    className="h-7 w-7 p-0 rounded-none border-slate-200 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <div className="px-3 border-x border-slate-100">
                                    <span className="text-[10px] font-bold uppercase">
                                        {page} <span className="text-slate-300">|</span> {totalPages}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages || loading}
                                    className="h-7 w-7 p-0 rounded-none border-slate-200 hover:bg-slate-50"
                                >
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
