'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, AlertCircle, Clock, Mail, FileText, Activity, User, Ticket as TicketIcon, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function TicketDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [ticket, setTicket] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await fetch(`/api/tickets/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setTicket(data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchTicket()
        // const interval = setInterval(fetchTicket, 10000)
        // return () => clearInterval(interval)
    }, [id])

    if (loading) {
        return <div className="p-8">Loading ticket details...</div>
    }

    if (!ticket) {
        return <div className="p-8">Ticket not found</div>
    }

    const workflow = ticket._linkedWorkflow
    const emailData = workflow?.workflowData?.email || {
        subject: workflow?.emailSubject || ticket.subject,
        from: workflow?.emailFrom || 'Unknown',
        body: 'No email content available for this ticket.',
        date: workflow?.createdAt || ticket.createdDate
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Ticket {ticket.servicenowTicketId || ticket.jiraTicketId}</h2>
                    <p className="text-muted-foreground">
                        {ticket.subject}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant={ticket.status === 'Resolved' ? 'secondary' : 'default'} className="text-lg py-1 px-4">
                        {ticket.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                {ticket.description || "No description provided."}
                            </div>
                        </CardContent>
                    </Card>

                    {workflow && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" /> Source Email
                                </CardTitle>
                                <CardDescription>
                                    Initial request from {emailData.from}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
                                    <div className="mb-4 border-b pb-2 text-muted-foreground flex justify-between">
                                        <span>From: {emailData.from}</span>
                                        <span>{emailData.date ? format(new Date(emailData.date), 'PPpp') : '-'}</span>
                                    </div>
                                    {emailData.body}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Details & Metadata */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Category</span>
                                <span>{ticket.category || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Priority</span>
                                <Badge variant="outline">{ticket.priority || 'Normal'}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {ticket.assignedTo || 'Unassigned'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Created</span>
                                <span className="text-sm">{ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, H:mm') : '-'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Integrations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticket.servicenowTicketId && (
                                <div className="flex items-center justify-between p-2 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-100 p-1.5 rounded-full">
                                            <TicketIcon className="h-4 w-4 text-green-700" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium">ServiceNow</p>
                                            <p className="text-xs text-muted-foreground">{ticket.servicenowTicketId}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" asChild>
                                        <a href="#" target="_blank"><ExternalLink className="h-4 w-4" /></a>
                                    </Button>
                                </div>
                            )}
                            {ticket.jiraTicketId && (
                                <div className="flex items-center justify-between p-2 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 p-1.5 rounded-full">
                                            <LinkIcon className="h-4 w-4 text-blue-700" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium">Jira</p>
                                            <p className="text-xs text-muted-foreground">{ticket.jiraTicketId}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" asChild>
                                        <a href="#" target="_blank"><ExternalLink className="h-4 w-4" /></a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {workflow && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Automation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <Link href={`/dashboard/workflows/${workflow._id}`}>
                                        View Workflow Execution
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
