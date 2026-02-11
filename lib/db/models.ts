/**
 * Database Models and Types
 */

import { ObjectId } from "mongodb";

export interface Company {
  _id?: ObjectId | string;
  name: string;
  domain: string;
  industry?: string;
  logoUrl?: string;
  timezone?: string;
  status: "pending" | "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: ObjectId | string;
  companyId: string | ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  role: "admin" | "hr" | "viewer";
  status: "active" | "inactive";
  createdAt: Date;
  lastLogin?: Date;
}

export interface CompanyIntegration {
  _id?: ObjectId | string;
  companyId: string | ObjectId;
  integrationType: "servicenow" | "jira" | "gmail" | "groq";
  configJson: string; // Encrypted JSON string
  status: "connected" | "disconnected" | "error";
  lastSyncedAt?: Date;
  /**
   * Optional non-sensitive configuration stored in plain JSON.
   * For example, for Jira we keep:
   * - baseUrl
   * - email
   * - projectKey
   * - issueType
   * while sensitive values like API tokens stay inside configJson (encrypted).
   */
  publicConfig?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  _id?: ObjectId | string;
  companyId: string | ObjectId;
  emailId?: string;
  emailSubject: string;
  emailFrom: string;
  status: "processing" | "completed" | "failed";
  servicenowTicketId?: string;
  jiraTicketId?: string;
  workflowData: Record<string, unknown>; // JSON object storing all steps
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface Ticket {
  _id?: ObjectId | string;
  companyId: string | ObjectId;
  workflowId?: string | ObjectId;
  servicenowTicketId?: string;
  jiraTicketId?: string;
  subject: string;
  description: string;
  category?: string;
  status: string;
  priority?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  _id?: ObjectId | string;
  companyId: string | ObjectId;
  workflowId?: string | ObjectId;
  actionType: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
