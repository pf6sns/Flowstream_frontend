import { Db, Collection } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import type {
  Company,
  User,
  CompanyIntegration,
  Workflow,
  Ticket,
  ActivityLog,
} from "./models";

/**
 * Database Collections Helper
 */
export class Collections {
  private static db: Db | null = null;

  private static async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  static async companies(): Promise<Collection<Company>> {
    const db = await this.getDb();
    return db.collection<Company>("companies");
  }

  static async users(): Promise<Collection<User>> {
    const db = await this.getDb();
    return db.collection<User>("users");
  }

  static async integrations(): Promise<Collection<CompanyIntegration>> {
    const db = await this.getDb();
    return db.collection<CompanyIntegration>("company_integrations");
  }

  static async workflows(): Promise<Collection<Workflow>> {
    const db = await this.getDb();
    return db.collection<Workflow>("workflows");
  }

  static async tickets(): Promise<Collection<Ticket>> {
    const db = await this.getDb();
    return db.collection<Ticket>("tickets");
  }

  static async activityLogs(): Promise<Collection<ActivityLog>> {
    const db = await this.getDb();
    return db.collection<ActivityLog>("activity_logs");
  }
}
