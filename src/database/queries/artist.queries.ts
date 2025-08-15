import { Transaction } from "kysely";
import { DatabaseManager } from "..";
import { DB } from "../../model/db";

export class ArtistQueries {
    static async fetchTop(limit: number = 5, from: Date, to: Date) {
        const db = DatabaseManager.getInstance();

        return db.selectFrom('posttop.channel')
            .select(['posttop.channel.id as artistID', db.fn.count('posttop.video.id').as('times')])
            .innerJoin('posttop.video', 'posttop.channel.id', 'posttop.video.channel_id')
            .innerJoin('posttop.listened', 'posttop.video.id', 'posttop.listened.video_id')
            .where('posttop.listened.listened_at', '>=', from)
            .where('posttop.listened.listened_at', '<=', to)
            .groupBy('posttop.channel.id')
            .orderBy('times', 'desc')
            .limit(limit)
            .execute();
    }


    static async fetchSingle(artistID: string) {
        const db = DatabaseManager.getInstance();
        return db
            .selectFrom('posttop.channel')
            .selectAll()
            .where('yt_id', '=', artistID)
            .executeTakeFirst();
    }

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