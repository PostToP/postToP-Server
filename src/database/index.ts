import {Kysely, PostgresDialect} from "kysely";
import {Pool} from "pg";
import type {DB} from "../model/db";
import {logger} from "../utils/logger";

export class DatabaseManager {
  private static _db: Kysely<DB> | null = null;

  public static getInstance(): Kysely<DB> {
    if (!DatabaseManager._db) {
      throw new Error("DatabaseManager not initialized. Call initialize() first.");
    }
    return DatabaseManager._db;
  }

  public static async initialize(): Promise<void> {
    if (DatabaseManager._db) return;

    DatabaseManager._db = new Kysely<DB>({
      log(event) {
        if (event.level === "error") {
          logger.error(event.error);
        } else if (event.level === "query") {
          logger.debug(
            `SQL: ${event.query.sql} -- ${event.query.parameters} (${event.queryDurationMillis.toFixed(2)}ms)`,
          );
        }
      },
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      }),
    });
    await DatabaseManager.testConnection();
  }

  private static async testConnection(): Promise<void> {
    await DatabaseManager._db?.selectFrom("posttop.video").select([]).limit(1).execute();
  }

  public static async close(): Promise<void> {
    if (DatabaseManager._db) {
      await DatabaseManager._db.destroy();
      DatabaseManager._db = null;
    }
  }
}
