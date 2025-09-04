import { Transaction } from "kysely";
import { DatabaseManager } from "..";
import { DB } from "../../model/db";

export class ArtistQueries {
    static async insert(trx: Transaction<DB>, artistID: string, name: string) {
        const db = DatabaseManager.getInstance();

        const exists = await db.selectFrom('posttop.channel')
            .select('id')
            .where('yt_id', '=', artistID)
            .executeTakeFirst();

        if (exists) {
            return exists;
        }

        return db.insertInto('posttop.channel')
            .values({ yt_id: artistID, name })
            .onConflict((oc) => oc.doNothing())
            .returning('id')
            .executeTakeFirst();
    }
}