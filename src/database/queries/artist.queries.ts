import type {Transaction} from "kysely";
import type {DB} from "../../model/db";
import type {ChannelYTID} from "../../model/override";

export class ArtistQueries {
  static async insert(trx: Transaction<DB>, artistID: ChannelYTID, name: string) {
    const exists = await trx.selectFrom("channel").select("id").where("yt_id", "=", artistID).executeTakeFirst();

    if (exists) {
      return exists;
    }

    return trx
      .insertInto("channel")
      .values({yt_id: artistID, name})
      .onConflict(oc => oc.doNothing())
      .returning("id")
      .executeTakeFirst();
  }
}
