import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../model/db";
import { Pool } from "pg";

export class DatabaseManager {
  private static _db: Kysely<DB> | null = null;

  public static getInstance(): Kysely<DB> {
    if (!this._db) {
      throw new Error("DatabaseManager not initialized. Call initialize() first.");
    }
    return this._db;
  }

  public static async initialize(): Promise<void> {
    if (this._db) return;

    this._db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      }),
    });
    await this.testConnection();
  }

  private static async testConnection(): Promise<void> {
    try {
      await this._db!.selectFrom('posttop.video').selectAll().execute();
    } catch (error) {
      throw error;
    }
  }


  public static async close(): Promise<void> {
    if (this._db) {
      await this._db.destroy();
      this._db = null;
    }
  }
}