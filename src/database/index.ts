import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect, sql } from "kysely";
import { Database } from "../model/database.model";

export class DatabaseManager {
  private static _db: Kysely<Database> | null = null;

  public static getInstance(): Kysely<Database> {
    if (!this._db) {
      throw new Error("DatabaseManager not initialized. Call initialize() first.");
    }
    return this._db;
  }

  public static async initialize(): Promise<void> {
    if (this._db) return;

    const sqliteDb = new SQLite(process.env.DB_PATH || "./db.sqlite");
    const dialect = new SqliteDialect({ database: sqliteDb });

    this._db = new Kysely<Database>({ dialect });
    await this.setupSchema();
  }


  public static async close(): Promise<void> {
    if (this._db) {
      await this._db.destroy();
      this._db = null;
    }
  }

  private static async setupSchema(): Promise<void> {
    if (!this._db) return;

    await sql`
      CREATE TABLE IF NOT EXISTS watched (
        musicID TEXT,
        datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (musicID) REFERENCES video(ID),
        PRIMARY KEY (datetime)
      )
    `.execute(this._db);

    await sql`
      CREATE TABLE IF NOT EXISTS video (
        ID TEXT,
        artistID TEXT,
        isMusic INTEGER,
        PRIMARY KEY (ID)
      )
    `.execute(this._db);

    await sql`
      CREATE TABLE IF NOT EXISTS filter (
        videoID TEXT,
        PRIMARY KEY (videoID)
      )
    `.execute(this._db);

    await sql`
      CREATE TABLE IF NOT EXISTS video_genre (
        videoID TEXT,
        genre TEXT,
        PRIMARY KEY (videoID, genre),
        FOREIGN KEY (videoID) REFERENCES video(ID)
      )
    `.execute(this._db);
  }
}