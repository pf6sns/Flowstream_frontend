/**
 * ServiceNow Integration Client
 * Communicates with the ServiceNow backend service
 */

const SERVICENOW_BACKEND_URL = process.env.NEXT_PUBLIC_SERVICENOW_BEND_URL || 'http://127.0.0.1:8001';
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

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
        this.baseUrl = (baseUrl || SERVICENOW_BACKEND_URL).replace(/\/+$/, '');
    }

    private async fetchJson<T>(
        path: string,
        init: RequestInit = {},
        options: {
            signal?: AbortSignal;
            timeoutMs?: number;
        } = {}
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
        const timeoutId = setTimeout(() => controller.abort(new Error("Request timeout")), timeoutMs);

        const abortFromCaller = () => controller.abort(options.signal?.reason);
        options.signal?.addEventListener("abort", abortFromCaller, { once: true });

        try {
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            const response = await fetch(`${this.baseUrl}${normalizedPath}`, {
                ...init,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(init.headers || {}),
                },
            });

            if (!response.ok) {
                throw new Error(`ServiceNow backend error: ${response.status} ${response.statusText}`);
            }

            return await response.json() as T;
        } finally {
            clearTimeout(timeoutId);
            options.signal?.removeEventListener("abort", abortFromCaller);
        }
    }

    /**
     * Fetch all tickets from ServiceNow via the backend
     */
    async fetchTickets(
        limit: number = 50,
        skip: number = 0,
        options: {
            signal?: AbortSignal;
            timeoutMs?: number;
        } = {}
    ): Promise<ServiceNowTicket[]> {
        try {
            const data = await this.fetchJson<{ tickets?: ServiceNowTicket[] }>(
                `/servicenow/tickets?limit=${limit}&offset=${skip}`,
                { method: 'GET' },
                options
            );
            return data.tickets || [];
        } catch (error) {
            console.error('Error fetching ServiceNow tickets:', error);
            return [];
        }
    }

    /**
     * Fetch a single ticket by number
     */
    async fetchTicketByNumber(
        ticketNumber: string,
        options: {
            signal?: AbortSignal;
            timeoutMs?: number;
        } = {}
    ): Promise<ServiceNowTicket | null> {
        try {
            const data = await this.fetchJson<{ ticket?: ServiceNowTicket }>(
                `/servicenow/tickets/${ticketNumber}`,
                { method: 'GET' },
                options
            );
            return data.ticket || null;
        } catch (error) {
            console.error('Error fetching ServiceNow ticket:', error);
            return null;
        }
    }

    /**
     * Trigger manual workflow (email check and ticket creation)
     */
    async triggerManualWorkflow(
        manual: boolean = true,
        options: {
            signal?: AbortSignal;
            timeoutMs?: number;
        } = {}
    ): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const data = await this.fetchJson<{ message?: string; data?: any }>(
                '/trigger-manual',
                {
                method: 'POST',
                body: JSON.stringify({ manual })
                },
                options
            );
            return { success: true, message: data.message || 'Workflow triggered', data: data.data };
        } catch (error) {
            console.error('Error triggering workflow:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * Check health status of ServiceNow backend
     */
    async healthCheck(options: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<boolean> {
        try {
            await this.fetchJson('/health', { method: 'GET' }, options);
            return true;
        } catch (error) {
            console.error('ServiceNow backend health check failed:', error);
            return false;
        }
    }
}

export const servicenowClient = new ServiceNowClient();
