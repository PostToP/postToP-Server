import {sql} from "kysely";
import {DatabaseManager} from "..";

type AiVersion = `v${number}.${number}.${number}`;

export class UserQueries {
  static async fetchBy(identifier: string | number, type: "username" | "handle" | "id") {
    const db = DatabaseManager.getInstance();

    return db.selectFrom("user").selectAll().where(type, "=", identifier).executeTakeFirst();
  }

  static async fetchAI(version: AiVersion) {
    const modelName = `model@${version}`;
    const db = DatabaseManager.getInstance();
    return db.selectFrom("user").selectAll().where("username", "=", modelName).executeTakeFirst();
  }

  static async betterAuthIdToUserId(betterAuthId: string) {
    const db = DatabaseManager.getInstance();
    const user = await db.selectFrom("user").select("id").where("better_auth_id", "=", betterAuthId).executeTakeFirst();
    return user?.id;
  }

  static async getUsersYTTokens(userID: number) {
    const db = DatabaseManager.getInstance();
    const res = await db
      .selectFrom("user")
      .innerJoin("user_better_auth", "user.better_auth_id", "user_better_auth.id")
      .innerJoin("account", "user_better_auth.id", "account.userId")
      .where("user.id", "=", userID)
      .select(["accessToken", "refreshToken", "accessTokenExpiresAt", "refreshTokenExpiresAt"])
      .limit(1)
      .execute();

    return res[0];
  }

  static async updateUserAccessToken(userID: number, newAccessToken: string, newExpiryDate: Date) {
    const db = DatabaseManager.getInstance();
    await db
      .updateTable("account")
      .set({
        accessToken: newAccessToken,
        accessTokenExpiresAt: newExpiryDate,
      })
      .where(
        "userId",
        "=",
        db
          .selectFrom("user_better_auth")
          .select("id")
          .where("id", "=", db.selectFrom("user").select("better_auth_id").where("id", "=", userID)),
      )
      .execute();
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

  static async getWeeklyTopMusic(user_id: number, startDate?: Date, endDate?: Date) {
    const db = DatabaseManager.getInstance();
    let query = UserQueries.getListenedAll(user_id, startDate, endDate);
    query = query
      .groupBy(["v.yt_id", "video_metadata.title", "c.name"])
      .select(eb => [
        eb.ref("v.yt_id").as("video_id"),
        eb.ref("video_metadata.title").as("title"),
        eb.ref("c.name").as("artist"),
        db.fn.count("listened.video_id").as("listen_count"),
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
        db.fn.count("listened.video_id").as("listen_count"),
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
      .select(eb => [eb.ref("cat.name").as("genre_name"), db.fn.count("listened.video_id").as("listen_count")])
      .orderBy("listen_count", "desc")
      .limit(10);
    return query.execute();
  }
}
