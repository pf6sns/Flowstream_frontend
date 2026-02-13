'use client'

import * as React from 'react'
import Link from 'next/link'
import {
    Search, RefreshCw, ChevronRight, ChevronLeft,
    Clock, CheckCircle2, AlertCircle, Loader2,
    Inbox, ArrowRight, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function TicketsPage() {
    const [tickets, setTickets] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchTerm, setSearchTerm] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState('all')

    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(8)
    const [totalTickets, setTotalTickets] = React.useState(0)

    const fetchTickets = React.useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (searchTerm) params.append('search', searchTerm)
            params.append('limit', pageSize.toString())
            params.append('skip', ((page - 1) * pageSize).toString())

            const res = await fetch(`/api/tickets?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setTickets(data.tickets)
                setTotalTickets(data.total)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load tickets')
        } finally {
            setLoading(false)
        }
    }, [statusFilter, searchTerm, page, pageSize])

    React.useEffect(() => {
        fetchTickets()
    }, [fetchTickets])

    const getStatusIcon = (status: string) => {
        const s = String(status).toLowerCase()
        if (s === 'resolved' || s === 'closed' || s === '6' || s === '7' || s === 'done' || s === 'fixed')
            return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        if (s === 'in progress' || s === '2' || s === 'active' || s === 'to do' || s === 'open')
            return <Clock className="h-3.5 w-3.5 text-brand shrink-0" />
        return <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
    }

    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            '1': 'New',
            '2': 'In progress',
            '6': 'Resolved',
            '7': 'Closed',
            'Open': 'Open',
            'In Progress': 'In progress',
            'Done': 'Done',
        }
        return map[status] || (status || 'Unknown')
    }

    const [exporting, setExporting] = React.useState(false)

    const exportToExcel = async () => {
        setExporting(true)
        const tid = toast.loading('Preparing export…')
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (searchTerm) params.append('search', searchTerm)
            params.append('limit', '500')
            params.append('skip', '0')
            const res = await fetch(`/api/tickets?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to fetch tickets')
            const data = await res.json()
            const allTickets = data.tickets || []
            const { buildTicketsWorkbook, downloadExcelBuffer } = await import('@/lib/exportTicketsToExcel')
            const buffer = await buildTicketsWorkbook(allTickets)
            downloadExcelBuffer(buffer, `tickets_export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`)
            toast.success('Export downloaded', { id: tid })
        } catch (e) {
            console.error(e)
            toast.error('Export failed', { id: tid })
        } finally {
            setExporting(false)
        }
    }

    const totalPages = Math.ceil(totalTickets / pageSize)
    const startRecord = totalTickets === 0 ? 0 : (page - 1) * pageSize + 1
    const endRecord = Math.min(page * pageSize, totalTickets)

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 text-slate-900 p-6 lg:p-10 font-sans">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Tickets
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} from ServiceNow and Jira
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={exportToExcel}
                            disabled={exporting}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 bg-white shadow-sm h-10 px-4"
                        >
                            <Download className={`mr-2 h-4 w-4 ${exporting ? 'animate-pulse' : ''}`} />
                            {exporting ? 'Exporting…' : 'Export'}
                        </Button>
                        <Button
                            onClick={fetchTickets}
                            disabled={loading}
                            className="rounded-xl bg-brand hover:bg-brand-400 text-white shadow-sm h-10 px-4"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Sync
                        </Button>
                    </div>
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
                                <SelectItem value="1">New</SelectItem>
                                <SelectItem value="2">In progress</SelectItem>
                                <SelectItem value="6">Resolved</SelectItem>
                                <SelectItem value="7">Closed</SelectItem>
                                <SelectItem value="Open">Open (Jira)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
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
            {loading && tickets.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col items-center justify-center min-h-[320px]">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="mt-4 text-sm font-medium text-slate-500">Loading tickets…</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {tickets.length > 0 ? tickets.map((ticket) => (
                            <Link
                                href={`/dashboard/tickets/${ticket.servicenowTicketId || ticket.jiraTicketId}`}
                                key={ticket._id}
                                className="group block"
                            >
                                <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-200">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <Badge
                                            variant="secondary"
                                            className="inline-flex items-center gap-1.5 rounded-lg border-0 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5"
                                        >
                                            {getStatusIcon(ticket.status)}
                                            {formatStatus(ticket.status)}
                                        </Badge>
                                        <span className="text-xs text-slate-400 shrink-0">
                                            {ticket.createdAt ? format(new Date(ticket.createdAt), 'dd MMM · HH:mm') : '—'}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-4 group-hover:text-brand transition-colors">
                                        {ticket.subject || 'No subject'}
                                    </h3>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 border border-slate-100">
                                            <span className="text-xs font-medium text-slate-500">ID</span>
                                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px] font-mono">
                                                {ticket.servicenowTicketId || ticket.jiraTicketId || '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 border border-slate-100">
                                            <span className="text-xs font-medium text-slate-500">Source</span>
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                                        ticket.source === 'ServiceNow' ? 'bg-brand' : 'bg-slate-600'
                                                    }`}
                                                />
                                                <span className="text-xs font-medium text-slate-700">
                                                    {ticket.source || '—'}
                                                </span>
                                            </div>
                                        </div>
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
                                <p className="text-sm font-medium text-slate-500">No tickets found</p>
                                <p className="text-xs text-slate-400 mt-1">Try adjusting filters or sync from integrations</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalTickets > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Showing {startRecord}–{endRecord} of {totalTickets}
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
