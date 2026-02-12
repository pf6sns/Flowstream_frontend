export type IntegrationType = "jira" | "servicenow" | "gmail" | "groq";

export type IntegrationStatus = {
  integrationType: IntegrationType;
  status: "connected" | "disconnected" | "error";
  lastSyncedAt?: string | null;
};

export type JiraConfig = {
  baseUrl: string;
  email: string;
  apiToken?: string;
  projectKey?: string;
  issueType?: string;
  hasToken?: boolean;
};

export type ServiceNowConfig = {
  instanceUrl: string;
  username: string;
  password?: string;
  table?: string;
  hasPassword?: boolean;
};

export type EmailProvider = "gmail" | "outlook" | "custom";

export type EmailConfig = {
  provider: EmailProvider;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  hasPassword?: boolean;
};

export type AIProvider = "openai" | "groq" | "gemini";

export type AIConfig = {
  provider: AIProvider;
  apiKey?: string;
  hasApiKey?: boolean;
};

export type IntegrationConfigByType = {
  jira: JiraConfig;
  servicenow: ServiceNowConfig;
  gmail: EmailConfig;
  groq: AIConfig;
};

export type StatusMap = Partial<Record<IntegrationType, IntegrationStatus>>;
export type ConfigMap = Partial<IntegrationConfigByType>;

export type IntegrationApiItem = {
  integrationType: IntegrationType;
  status: "connected" | "disconnected" | "error";
  lastSyncedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  config?: unknown;
};

export type IntegrationsApiResponse = {
  integrations?: IntegrationApiItem[];
};
