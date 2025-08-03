import { DatabaseManager } from "..";

export class MusicQueries {
    static async insertWatched(musicID: string, userID: number) {
        const db = DatabaseManager.getInstance();
        return db
            .insertInto('posttop.listened')
            .values({ video_id: musicID, user_id: userID, listened_at: new Date().toISOString() })
            .onConflict((oc) => oc.doNothing())
            .execute();
    }

    static async fetchTop(limit: number, from: Date, to: Date) {
        const db = DatabaseManager.getInstance();
        return db
            .selectFrom('posttop.video')
            .select(['posttop.video.yt_id as musicID', db.fn.count('posttop.listened.video_id').as('times')])
            .innerJoin('posttop.listened', 'posttop.video.id', 'posttop.listened.video_id')
            .where('posttop.listened.listened_at', '>=', from)
            .where('posttop.listened.listened_at', '<=', to)
            .groupBy('posttop.video.id')
            .orderBy('times', 'desc')
            .limit(limit)
            .execute();
    }

    static async fetchLatest(limit: number) {
        const db = DatabaseManager.getInstance();
        return db
            .selectFrom('posttop.video')
            .innerJoin('posttop.listened', 'posttop.video.id', 'posttop.listened.video_id')
            .selectAll()
            .orderBy('posttop.listened.listened_at', 'desc')
            .limit(limit)
            .execute();
    }
}