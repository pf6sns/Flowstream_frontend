export interface Workflow {
    _id?: string;
    companyId: string;
    emailId: string;
    emailFrom: string;
    emailSubject: string;
    status: string; // 'processing' | 'completed' | 'failed'
    startedAt: Date;
    createdAt: string; // ISO date string
    servicenowTicketId?: string;
    jiraTicketId?: string;
    workflowData?: {
        email?: {
            subject: string;
            from: string;
            body: string;
        };
        steps?: WorkflowStep[];
        logs?: WorkflowLog[];
    };
}

export interface WorkflowStep {
    id: number | string;
    name: string;
    status: string; // 'pending' | 'in-progress' | 'completed' | 'failed'
    timestamp?: string;
}

export interface WorkflowLog {
    id?: string;
    message: string;
    level: 'info' | 'warn' | 'error';
    timestamp: string;
}

export interface Ticket {
    id: string;
    subject: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    category: string;
    createdDate: string;
    assignedTo?: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
}
