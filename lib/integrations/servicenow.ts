/**
 * ServiceNow Integration Client
 * Communicates with the ServiceNow backend service
 */

const SERVICENOW_BACKEND_URL = process.env.NEXT_PUBLIC_SERVICENOW_BEND_URL || 'http://127.0.0.1:8001';

export interface ServiceNowTicket {
    sys_id: string;
    number: string;
    short_description: string;
    description?: string;
    state: string;
    priority: string;
    category?: string;
    assigned_to?: string;
    caller_id?: string;
    sys_created_on: string;
    sys_updated_on: string;
    jira_ticket_id?: string;
}

export class ServiceNowClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || SERVICENOW_BACKEND_URL;
    }

    /**
     * Fetch all tickets from ServiceNow via the backend
     */
    async fetchTickets(limit: number = 50, skip: number = 0): Promise<ServiceNowTicket[]> {
        try {
            const response = await fetch(`${this.baseUrl}/servicenow/tickets?limit=${limit}&offset=${skip}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`ServiceNow backend error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.tickets || [];
        } catch (error) {
            console.error('Error fetching ServiceNow tickets:', error);
            return [];
        }
    }

    /**
     * Fetch a single ticket by number
     */
    async fetchTicketByNumber(ticketNumber: string): Promise<ServiceNowTicket | null> {
        try {
            const response = await fetch(`${this.baseUrl}/servicenow/tickets/${ticketNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.ticket || null;
        } catch (error) {
            console.error('Error fetching ServiceNow ticket:', error);
            return null;
        }
    }

    /**
     * Trigger manual workflow (email check and ticket creation)
     */
    async triggerManualWorkflow(manual: boolean = true): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const response = await fetch(`${this.baseUrl}/trigger-manual`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ manual })
            });

            if (!response.ok) {
                throw new Error(`Failed to trigger workflow: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, message: data.message || 'Workflow triggered', data: data.data };
        } catch (error) {
            console.error('Error triggering workflow:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * Check health status of ServiceNow backend
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            console.error('ServiceNow backend health check failed:', error);
            return false;
        }
    }
}

export const servicenowClient = new ServiceNowClient();
