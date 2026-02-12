/**
 * Jira Integration Client
 * Communicates with the Jira backend service
 */

const JIRA_BACKEND_URL = process.env.NEXT_PUBLIC_JIRA_BEND_URL || 'http://127.0.0.1:8000';

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
        this.baseUrl = baseUrl || JIRA_BACKEND_URL;
    }

    /**
     * Fetch all Jira issues
     */
    async fetchIssues(limit: number = 50, skip: number = 0): Promise<JiraIssue[]> {
        try {
            const response = await fetch(`${this.baseUrl}/jira/issues?limit=${limit}&offset=${skip}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Jira backend error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.issues || [];
        } catch (error) {
            console.error('Error fetching Jira issues:', error);
            return [];
        }
    }

    /**
     * Fetch a single issue by key
     */
    async fetchIssueByKey(issueKey: string): Promise<JiraIssue | null> {
        try {
            const response = await fetch(`${this.baseUrl}/jira/issues/${issueKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.issue || null;
        } catch (error) {
            console.error('Error fetching Jira issue:', error);
            return null;
        }
    }

    /**
     * Create and auto-assign a new Jira issue
     */
    async createIssue(summary: string, description: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/jira/auto-assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ summary, description }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.detail || 'Failed to create issue' };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error creating Jira issue:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * Check health status of Jira backend
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            console.error('Jira backend health check failed:', error);
            return false;
        }
    }
}

export const jiraClient = new JiraClient();
