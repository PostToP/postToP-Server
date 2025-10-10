import {sql, type Transaction} from "kysely";
import type {DB} from "../../model/db";
import type {ChannelID, VideoID, VideoYTID} from "../../model/override";
import {DatabaseManager} from "..";

export interface QueryForAllParams {
  limit?: number;
  page?: number;
  sortBy?: string;
  reverse?: boolean;
  filters?: {
    verified?: boolean;
    music?: boolean;
    hasNER?: boolean;
  };
}

export class VideoQueries {
  static async fetch(videoID: VideoYTID) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("video").selectAll().where("yt_id", "=", videoID).executeTakeFirst();
  }

  static async fetchAiData(id: VideoID) {
    const db = DatabaseManager.getInstance();

    return db
      .selectFrom("video")
      .innerJoin("video_metadata", join =>
        join
          .onRef("video.id", "=", "video_metadata.video_id")
          .onRef("video_metadata.language", "=", "video.default_language"),
      )
      .innerJoin("channel as channel", "video.channel_id", "channel.id")
      .leftJoin(
        qb => {
          return qb
            .selectFrom("video_category")
            .innerJoin("category", "video_category.category_id", "category.id")
            .select([sql`array_agg(category.name)`.as("categories"), "video_category.video_id"])
            .groupBy("video_category.video_id")
            .as("categories");
        },
        join => join.onRef("video.id", "=", "categories.video_id"),
      )
      .selectAll()
      .where("video.id", "=", id)
      .executeTakeFirst();
  }

  static async insert(
    trx: Transaction<DB>,
    videoID: VideoYTID,
    artistID: ChannelID,
    duration: number,
    main_category_id: number,
    default_language: string,
  ) {
    const exists = await trx.selectFrom("video").select("id").where("yt_id", "=", videoID).executeTakeFirst();

    if (exists) {
      return exists;
    }

    return trx
      .insertInto("video")
      .values({
        yt_id: videoID,
        channel_id: artistID,
        duration: duration,
        main_category_id: main_category_id,
        default_language: default_language,
      })
      .onConflict(oc => oc.doNothing())
      .returning("id")
      .executeTakeFirst();
  }

  static async insertMetadata(trx: Transaction<DB>, id: VideoID, language: string, title: string, description: string) {
    return trx
      .insertInto("video_metadata")
      .values({video_id: id, language, title, description})
      .onConflict(oc => oc.doNothing())
      .execute();
  }

  static async fetchIsMusicByAdmin(videoID: VideoID) {
    const db = DatabaseManager.getInstance();
    return db
      .selectFrom("is_music_video")
      .where("video_id", "=", videoID)
      .where(
        "submitted_by_id",
        "in",
        db
          .selectFrom("user_role")
          .innerJoin("role", "user_role.role_id", "role.id")
          .select("user_id")
          .where("role.name", "=", "Admin"),
      )
      .selectAll()
      .executeTakeFirst();
  }

  static async fetchIsMusicByAI(videoID: VideoID) {
    const db = DatabaseManager.getInstance();
    return db
      .selectFrom("is_music_video")
      .where("video_id", "=", videoID)
      .where(
        "submitted_by_id",
        "in",
        db
          .selectFrom("user_role")
          .innerJoin("role", "user_role.role_id", "role.id")
          .select("user_id")
          .where("role.name", "=", "ai"),
      )
      .selectAll()
      .executeTakeFirst();
  }

  static async insertIsMusic(videoID: VideoID, userID: number, is_music: boolean) {
    const db = DatabaseManager.getInstance();
    return db
      .insertInto("is_music_video")
      .values({
        video_id: videoID,
        submitted_by_id: userID,
        is_music: is_music,
      })
      .onConflict(oc => oc.doNothing())
      .execute();
  }

  static async fetchDataAll(videoID: VideoID) {
    const db = DatabaseManager.getInstance();
    return db
      .selectFrom("video")
      .innerJoin("video_metadata", join =>
        join
          .onRef("video.id", "=", "video_metadata.video_id")
          .onRef("video.default_language", "=", "video_metadata.language"),
      )
      .innerJoin("channel as channel", "video.channel_id", "channel.id")
      .selectAll()
      .where("video.id", "=", videoID)
      .executeTakeFirst();
  }

  private static async getQueryForAll(params: QueryForAllParams) {
    const db = DatabaseManager.getInstance();
    const page = params.page || 0;
    const limit = params.limit || 20;

    let query = db
      .selectFrom("video")
      .innerJoin("video_metadata", join =>
        join
          .onRef("video.id", "=", "video_metadata.video_id")
          .onRef("video.default_language", "=", "video_metadata.language"),
      )
      .leftJoin("is_music_video", "video.id", "is_music_video.video_id")
      .innerJoin(db.selectFrom("channel").select(["id", "name"]).as("channel"), "video.channel_id", "channel.id");

    if (params.sortBy) {
      const columns = {
        alphabetical: sql`video_metadata.title`,
        duration: sql`video.duration`,
        date: sql`video.created_at`,
        random: sql`random()`,
      };

      query = query.orderBy(columns[params.sortBy as keyof typeof columns], params.reverse ? "desc" : "asc");
    }

    if (params.filters?.verified !== undefined) {
      console.log("filtering by verified", params.filters.verified);
      if (params.filters.verified) {
        query = query.where(
          "is_music_video.submitted_by_id",
          "in",
          db
            .selectFrom("user_role")
            .innerJoin("role", "user_role.role_id", "role.id")
            .select("user_id")
            .where("role.name", "=", "Admin"),
        );
      } else {
        query = query.where(eb =>
          eb.or([
            eb(
              "is_music_video.video_id",
              "not in",
              db
                .selectFrom("is_music_video")
                .innerJoin("user_role", "is_music_video.submitted_by_id", "user_role.user_id")
                .innerJoin("role", "user_role.role_id", "role.id")
                .select("is_music_video.video_id")
                .where("role.name", "=", "Admin"),
            ),
            eb("is_music_video.video_id", "is", null),
          ]),
        );
      }
    }

    if (params.filters?.music !== undefined) {
      if (params.filters.music) {
        query = query.where("is_music_video.is_music", "=", true);
      } else {
        query = query.where("is_music_video.is_music", "=", false);
      }
    }

    if (params.filters?.hasNER !== undefined) {
      if (params.filters.hasNER) {
        query = query.where("video.id", "in", db.selectFrom("ner_result").select("video_id"));
      } else {
        query = query.where("video.id", "not in", db.selectFrom("ner_result").select("video_id"));
      }
    }
    query = query.limit(limit).offset(page * limit);

    return query;
  }

  static async fetchAll(params: QueryForAllParams) {
    const query = await VideoQueries.getQueryForAll(params);
    return query.selectAll().execute();
  }

  static async numberOfVideos(params: QueryForAllParams) {
    const query = await VideoQueries.getQueryForAll(params);
    const totalCount = await query.select(_eb => [sql`count(*)`.as("total_count")]).executeTakeFirstOrThrow();
    return totalCount.total_count as number;
  }

  static async insertNERReview(
    videoID: VideoID,
    userID: number,
    language: any,
    namedEntities: {NER: string; text: string; start: number; end: number}[],
  ) {
    console.log("Inserting NER review", videoID, userID, language, JSON.stringify(namedEntities));
    const db = DatabaseManager.getInstance();
    return db
      .insertInto("ner_result")
      .values({
        video_id: videoID,
        language: language,
        submitted_by_id: userID,
        ner_result: sql`${JSON.stringify(namedEntities)}::jsonb`,
      })
      .onConflict(oc => oc.doNothing())
      .execute();
  }
}
