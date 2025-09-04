import { Transaction } from "kysely";
import { DB } from "../../model/db";

export class ArtistQueries {
    static async insert(trx: Transaction<DB>, artistID: string, name: string) {
        const exists = await trx.selectFrom('posttop.channel')
            .select('id')
            .where('yt_id', '=', artistID)
            .executeTakeFirst();

        if (exists) {
            return exists;
        }

        return trx.insertInto('posttop.channel')
            .values({ yt_id: artistID, name })
            .onConflict((oc) => oc.doNothing())
            .returning('id')
            .executeTakeFirst();
    }
}