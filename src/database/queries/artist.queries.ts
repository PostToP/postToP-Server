import type {Transaction} from "kysely";
import type {DB} from "../../model/db";
import type {ChannelYTID} from "../../model/override";
import {DatabaseManager} from "..";

export class ArtistQueries {
  static async insert(trx: Transaction<DB>, artistID: ChannelYTID, name: string, profile_picture_uri: string) {
    const exists = await trx.selectFrom("channel").select("id").where("yt_id", "=", artistID).executeTakeFirst();

    if (exists) {
      return exists;
    }

    return trx
      .insertInto("channel")
      .values({yt_id: artistID, name, profile_picture_uri})
      .onConflict(oc => oc.doNothing())
      .returning("id")
      .executeTakeFirst();
  }

  static async fetchByYTID(artistID: ChannelYTID) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("channel").where("yt_id", "=", artistID).select("id").executeTakeFirst();
  }
}
