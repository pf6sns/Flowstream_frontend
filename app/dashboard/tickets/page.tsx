'use client'

import * as React from 'react'
import Link from 'next/link'
import {
    Search, RefreshCw, Mail, Ticket, Code,
    ChevronRight, ChevronLeft, Filter,
    Clock, CheckCircle2, AlertCircle, Loader2,
    Activity, Inbox, Layers, Terminal, ArrowRight, Download
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
            toast.error('Ticket record retrieval error')
        } finally {
            setLoading(false)
        }
    }, [statusFilter, searchTerm, page, pageSize])

    React.useEffect(() => {
        fetchTickets()
    }, [fetchTickets])

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'resolved' || s === 'closed' || s === '6' || s === '7' || s === 'done' || s === 'fixed')
            return <CheckCircle2 className="h-3 w-3 mr-1.5 text-emerald-600" />
        if (s === 'in progress' || s === '2' || s === 'active' || s === 'to do')
            return <Clock className="h-3 w-3 mr-1.5 text-brand" />
        return <AlertCircle className="h-3 w-3 mr-1.5 text-slate-400" />
    }

    const exportToCSV = () => {
        const headers = ['ID', 'Subject', 'Status', 'Source', 'Created']
        const rows = tickets.map(t => [
            t.servicenowTicketId || t.jiraTicketId || t._id,
            t.subject,
            t.status,
            t.source,
            t.createdAt ? format(new Date(t.createdAt), 'yyyy-MM-dd') : 'N/A'
        ])
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "master_ticket_registry.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const totalPages = Math.ceil(totalTickets / pageSize)

    return (
        <div className="flex-1 space-y-4 p-6 bg-slate-50 min-h-screen text-[#242424]">
            {/* COMPACT REGISTRY HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0065ff] px-2 py-1.5 rounded-sm">
                        <Terminal className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-tight">Master Ticket Registry</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-none border-slate-300 font-bold bg-white uppercase">
                                Remote Feed
                            </Badge>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">LIVE_STATUS_ACTIVE</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={exportToCSV} variant="outline" size="sm" className="rounded-sm border-slate-200 text-[10px] font-bold uppercase tracking-widest h-9 px-3">
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Export Audit
                    </Button>
                    <Button onClick={fetchTickets} size="sm" className="bg-[#0065ff] hover:bg-[#0047b3] text-white rounded-sm h-9 px-4 font-bold text-xs shadow-sm">
                        <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        SYSTEM_REFRESH
                    </Button>
                </div>
            </div>

            {/* MINIMALIST FILTER STRIP */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white border border-slate-200 p-2 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        placeholder="Search Registry by ID or Subject..."
                        className="pl-8 h-8 bg-slate-50 border-slate-200 rounded-sm text-xs font-medium focus-visible:ring-1 focus-visible:ring-brand"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-[140px] h-8 bg-white border-slate-200 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                            <SelectValue placeholder="System Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="all">Global States</SelectItem>
                            <SelectItem value="1">New (SN)</SelectItem>
                            <SelectItem value="2">In Progress (SN)</SelectItem>
                            <SelectItem value="6">Resolved (SN)</SelectItem>
                            <SelectItem value="7">Closed (SN)</SelectItem>
                            <SelectItem value="Open">Open (Jira)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* DATA GRID */}
            {loading && tickets.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-[300px] border border-slate-200 bg-white">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-4 tracking-[0.2em]">Synchronizing Registry...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {tickets.length > 0 ? tickets.map((ticket) => (
                            <Link href={`/dashboard/tickets/${ticket.servicenowTicketId || ticket.jiraTicketId}`} key={ticket._id} className="group">
                                <div className="bg-white border border-slate-200 rounded-sm p-4 h-full flex flex-col hover:border-brand transition-colors relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            {getStatusIcon(ticket.status)}
                                            {ticket.status === '1' ? 'New' : ticket.status === '2' ? 'In Progress' : ticket.status === '6' ? 'Resolved' : ticket.status === '7' ? 'Closed' : ticket.status}
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-50 px-1 py-0.5 border border-slate-100 uppercase">
                                            {ticket.createdAt ? format(new Date(ticket.createdAt), 'dd.MM.yy') : 'SYS_TS'}
                                        </span>
                                    </div>

                                    <h3 className="text-xs font-bold text-[#242424] leading-snug line-clamp-2 min-h-[2.5rem] mb-4 group-hover:text-brand transition-colors">
                                        {ticket.subject || 'UNLABELED_RECORD'}
                                    </h3>

                                    <div className="mt-auto space-y-1.5">
                                        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border border-slate-100">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID_REF</span>
                                            <span className="text-[10px] font-mono font-bold text-slate-600 truncate max-w-[120px]">
                                                {ticket.servicenowTicketId || ticket.jiraTicketId}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border border-slate-100">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ORIGIN</span>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${ticket.source === 'ServiceNow' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">{ticket.source}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter text-slate-400 group-hover:text-brand transition-colors">
                                        <span>SYSTEM_ANALYSIS</span>
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed">
                                <Inbox className="h-8 w-8 text-slate-200 mb-2" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Set Empty</span>
                            </div>
                        )}
                    </div>

                    {/* PAGINATION */}
                    {totalTickets > 0 && (
                        <div className="flex items-center justify-between bg-white border border-slate-200 p-2 shadow-sm">
                            <div className="text-[9px] font-bold text-slate-400 px-4 uppercase tracking-[0.2em]">
                                RECORD SET: {Math.min(totalTickets, (page - 1) * pageSize + 1)}-{Math.min(page * pageSize, totalTickets)} / {totalTickets}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setPage(page - 1)} disabled={page === 1 || loading}
                                    className="h-7 w-7 p-0 rounded-none border-slate-200 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <div className="px-3 border-x border-slate-100 text-[10px] font-bold uppercase">
                                    {page} <span className="text-slate-300">/</span> {totalPages}
                                </div>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setPage(page + 1)} disabled={page >= totalPages || loading}
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
