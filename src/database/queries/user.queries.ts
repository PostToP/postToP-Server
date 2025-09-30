import { sql } from "kysely";
import { DatabaseManager } from "..";

type AiVersion = `v${number}.${number}.${number}`;

export class UserQueries {
  static async fetchBy(identifier: string | number, type: "username" | "handle" | "id") {
    const db = DatabaseManager.getInstance();

    return db.selectFrom("posttop.user").selectAll().where(type, "=", identifier).executeTakeFirst();
  }

  static async fetchHash(username: string) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("posttop.user").select(["password_hash"]).where("username", "=", username).executeTakeFirst();
  }

  static async fetchAI(version: AiVersion) {
    const modelName = `model@${version}`;
    const db = DatabaseManager.getInstance();
    return db.selectFrom("posttop.user").selectAll().where("username", "=", modelName).executeTakeFirst();
  }

  static async getListenedMusic(userHandle: string) {
    const db = DatabaseManager.getInstance();
    return db
      .selectFrom("posttop.listened")
      .where("user_id", "=", db.selectFrom("posttop.user").select("id").where("handle", "=", userHandle))
      .innerJoin("posttop.video as v", "posttop.listened.video_id", "v.id")
      .innerJoin("posttop.video_metadata", join =>
        join
          .onRef("v.id", "=", "posttop.video_metadata.video_id")
          .onRef("default_language", "=", "posttop.video_metadata.language"),
      )
      .orderBy("listened_at", "desc")
      .selectAll()
      .limit(50)
      .execute();
  }

  private static getListenedAll(user_id: number, startDate?: Date, endDate?: Date) {
    const db = DatabaseManager.getInstance();
    let query = db
      .selectFrom("posttop.listened")
      .where("user_id", "=", user_id)
      .innerJoin("posttop.video as v", "posttop.listened.video_id", "v.id")
      .innerJoin("posttop.video_metadata", join =>
        join
          .onRef("v.id", "=", "posttop.video_metadata.video_id")
          .onRef("default_language", "=", "posttop.video_metadata.language"),
      )
      .innerJoin("posttop.channel as c", "v.channel_id", "c.id")
      .innerJoin("posttop.video_category as vc", "v.id", "vc.video_id")
      .innerJoin("posttop.category as cat", "vc.category_id", "cat.id");

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

  static async getWeeklyTopMusic(user_id: number, startDate?: Date, endDate?: Date) {
    const db = DatabaseManager.getInstance();
    let query = UserQueries.getListenedAll(user_id, startDate, endDate);
    query = query
      .groupBy(["v.yt_id", "posttop.video_metadata.title", "c.name"])
      .select(eb => [
        eb.ref("v.yt_id").as("video_id"),
        eb.ref("posttop.video_metadata.title").as("title"),
        eb.ref("c.name").as("artist"),
        db.fn.count("posttop.listened.video_id").as("listen_count"),
      ])
      .orderBy("listen_count", "desc")
      .limit(10);
    return query.execute();
  }

  static async getWeeklyTopArtists(user_id: number, startDate?: Date, endDate?: Date) {
    const db = DatabaseManager.getInstance();
    let query = UserQueries.getListenedAll(user_id, startDate, endDate);
    query = query
      .groupBy(["c.yt_id", "c.name"])
      .select(eb => [
        eb.ref("c.yt_id").as("artist_id"),
        eb.ref("c.name").as("artist_name"),
        db.fn.count("posttop.listened.video_id").as("listen_count"),
      ])
      .orderBy("listen_count", "desc")
      .limit(10);
    return query.execute();
  }

  static async getWeeklyTopGenres(user_id: number, startDate?: Date, endDate?: Date) {
    // TODO: with new category system
    const db = DatabaseManager.getInstance();
    let query = UserQueries.getListenedAll(user_id, startDate, endDate);
    query = query
      .groupBy(["cat.id", "cat.name"])
      .select(eb => [eb.ref("cat.name").as("genre_name"), db.fn.count("posttop.listened.video_id").as("listen_count")])
      .orderBy("listen_count", "desc")
      .limit(10);
    return query.execute();
  }
}
