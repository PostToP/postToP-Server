import {sql} from "kysely";
import type {ModelType} from "../../model/db";
import {DatabaseManager} from "..";

export class UserQueries {
  static async fetchBy(identifier: string | number, type: "username" | "handle" | "id") {
    const db = DatabaseManager.getInstance();

    return db.selectFrom("user").selectAll().where(type, "=", identifier).executeTakeFirst();
  }

  static async fetchAI(type: ModelType, version: string) {
    const db = DatabaseManager.getInstance();
    return db
      .selectFrom("model")
      .selectAll()
      .where("type", "=", type)
      .where("version", "=", version)
      .executeTakeFirst();
  }

  static async fetchHash(username: string) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("user").select(["password_hash"]).where("username", "=", username).executeTakeFirst();
  }

  static async getListenedMusic(userHandle: string) {
    const db = DatabaseManager.getInstance();
    return db
      .selectFrom("listened")
      .where("user_id", "=", db.selectFrom("user").select("id").where("handle", "=", userHandle))
      .innerJoin("video as v", "listened.video_id", "v.id")
      .innerJoin("video_metadata", join =>
        join.onRef("v.id", "=", "video_metadata.video_id").onRef("default_language", "=", "video_metadata.language"),
      )
      .orderBy("listened_at", "desc")
      .selectAll()
      .limit(50)
      .execute();
  }

  private static getListenedAll(user_id: number, startDate?: Date, endDate?: Date) {
    const db = DatabaseManager.getInstance();
    let query = db
      .selectFrom("listened")
      .where("user_id", "=", user_id)
      .innerJoin("video as v", "listened.video_id", "v.id")
      .innerJoin("video_metadata", join =>
        join.onRef("v.id", "=", "video_metadata.video_id").onRef("default_language", "=", "video_metadata.language"),
      )
      .innerJoin("channel as c", "v.channel_id", "c.id")
      .innerJoin("video_category as vc", "v.id", "vc.video_id")
      .innerJoin("category as cat", "vc.category_id", "cat.id");

    if (endDate) {
      query = query.where("listened_at", "<=", endDate);
    }

    if (startDate) {
      query = query.where("listened_at", ">=", startDate);
    } else {
      query = query.where("listened_at", ">", sql<Date>`NOW() - INTERVAL '7 day'`);
    }

    return query;
  }

  static async getTopMusic(user_id: number, startDate?: Date, endDate?: Date) {
    const db = DatabaseManager.getInstance();
    let query = UserQueries.getListenedAll(user_id, startDate, endDate);
    query = query
      .groupBy(["v.yt_id", "video_metadata.title", "c.name", "c.yt_id"])
      .select(eb => [
        eb.ref("v.yt_id").as("video_id"),
        eb.ref("video_metadata.title").as("video_title"),
        eb.ref("c.name").as("artist_name"),
        eb.ref("c.yt_id").as("artist_id"),
        db.fn.count("listened.video_id").as("listen_count"),
      ])
      .orderBy("listen_count", "desc")
      .limit(10);

    type TopMusicRow = {
      video_id: string;
      video_title: string;
      artist_name: string;
      artist_id: string;
      listen_count: number;
    };

    return query.execute() as Promise<TopMusicRow[]>;
  }

  static async getTopArtists(user_id: number, startDate?: Date, endDate?: Date) {
    const db = DatabaseManager.getInstance();
    let query = UserQueries.getListenedAll(user_id, startDate, endDate);
    query = query
      .groupBy(["c.yt_id", "c.name"])
      .select(eb => [
        eb.ref("c.yt_id").as("artist_id"),
        eb.ref("c.name").as("artist_name"),
        db.fn.count("listened.video_id").as("listen_count"),
      ])
      .orderBy("listen_count", "desc")
      .limit(10);
    return query.execute();
  }

  static async getTopGenres(user_id: number, startDate?: Date, endDate?: Date) {
    // TODO: with new category system
    const db = DatabaseManager.getInstance();
    let query = UserQueries.getListenedAll(user_id, startDate, endDate);
    query = query
      .groupBy(["cat.id", "cat.name"])
      .select(eb => [eb.ref("cat.name").as("genre_name"), db.fn.count("listened.video_id").as("listen_count")])
      .orderBy("listen_count", "desc")
      .limit(10);
    return query.execute();
  }
}
