/**
 * Jira Integration Client
 * Communicates with the Jira backend service
 */

const JIRA_BACKEND_URL = process.env.NEXT_PUBLIC_JIRA_BEND_URL || 'http://127.0.0.1:8000';
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

export interface JiraIssue {
    key: string;
    id: string;
    fields: {
        summary: string;
        description?: string;
        status: {
            name: string;
        };
        priority?: {
            name: string;
        };
        assignee?: {
            displayName: string;
            emailAddress: string;
        };
        created: string;
        updated: string;
        issuetype?: {
            name: string;
        };
    };
}

export class JiraClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = (baseUrl || JIRA_BACKEND_URL).replace(/\/+$/, '');
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
                throw new Error(`Jira backend error: ${response.status} ${response.statusText}`);
            }

            return await response.json() as T;
        } finally {
            clearTimeout(timeoutId);
            options.signal?.removeEventListener("abort", abortFromCaller);
        }
    }

    /**
     * Fetch all Jira issues
     */
    async fetchIssues(
        limit: number = 50,
        skip: number = 0,
        options: {
            signal?: AbortSignal;
            timeoutMs?: number;
        } = {}
    ): Promise<JiraIssue[]> {
        try {
            const data = await this.fetchJson<{ issues?: JiraIssue[] }>(
                `/jira/issues?limit=${limit}&offset=${skip}`,
                { method: 'GET' },
                options
            );
            return data.issues || [];
        } catch (error) {
            console.error('Error fetching Jira issues:', error);
            return [];
        }
    }

    /**
     * Fetch a single issue by key
     */
    async fetchIssueByKey(
        issueKey: string,
        options: {
            signal?: AbortSignal;
            timeoutMs?: number;
        } = {}
    ): Promise<JiraIssue | null> {
        try {
            const data = await this.fetchJson<{ issue?: JiraIssue }>(
                `/jira/issues/${issueKey}`,
                { method: 'GET' },
                options
            );
            return data.issue || null;
        } catch (error) {
            console.error('Error fetching Jira issue:', error);
            return null;
        }
    }

    /**
     * Create and auto-assign a new Jira issue
     */
    async createIssue(
        summary: string,
        description: string,
        options: {
            signal?: AbortSignal;
            timeoutMs?: number;
        } = {}
    ): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const data = await this.fetchJson<any>(
                '/jira/auto-assign',
                {
                method: 'POST',
                body: JSON.stringify({ summary, description }),
                },
                options
            );
            return { success: true, data };
        } catch (error) {
            console.error('Error creating Jira issue:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * Check health status of Jira backend
     */
    async healthCheck(options: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<boolean> {
        try {
            await this.fetchJson('/health', { method: 'GET' }, options);
            return true;
        } catch (error) {
            console.error('Jira backend health check failed:', error);
            return false;
        }
    }
}

export const jiraClient = new JiraClient();
