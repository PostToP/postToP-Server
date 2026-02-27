import {sql, type Transaction} from "kysely";
import type {DB} from "../../model/db";
import type {ChannelYTID} from "../../model/override";
import {DatabaseManager} from "..";

export class ArtistQueries {
  static async insert(trx: Transaction<DB>, artistID: ChannelYTID, name: string, profile_picture_uri: string) {
    return trx
      .insertInto("channel")
      .values({yt_id: artistID, name, profile_picture_uri})
      .onConflict(oc => oc.column("yt_id").doUpdateSet({yt_id: artistID}))
      .returning("id")
      .executeTakeFirst();
  }

  static async fetchByYTID(artistID: ChannelYTID) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("channel").where("yt_id", "=", artistID).select("id").executeTakeFirst();
  }

  static async numberOfArtists() {
    const db = DatabaseManager.getInstance();
    const result = await db
      .selectFrom("channel")
      .innerJoin("video", "channel.id", "video.channel_id")
      .innerJoin("is_music_video", "video.id", "is_music_video.video_id")
      .innerJoin("is_music_video_prediction", "video.id", "is_music_video_prediction.video_id")
      .where(eb =>
        eb.or([eb("is_music_video.is_music", "=", true), eb("is_music_video_prediction.is_music", "=", true)]),
      )
      .select(_eb => [sql`count(channel.id)`.as("count")])
      .executeTakeFirst();

    return result?.count ?? 0;
  }
}
