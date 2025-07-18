import { DatabaseManager } from "..";

export async function insertMusicWatched(musicID: string) {
    const db = DatabaseManager.getInstance();
    return db
        .insertInto('posttop.listened')
        .values({ video_id: musicID, user_id: 1, listened_at: new Date().toISOString() })
        .onConflict((oc) => oc.doNothing())
        .execute();
}

export function fetchTopMusic(limit: number, from: Date, to: Date) {
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


export async function fetchLatestMusic(limit: number) {
    const db = DatabaseManager.getInstance();
    return db
        .selectFrom('posttop.video')
        .innerJoin('posttop.listened', 'posttop.video.id', 'posttop.listened.video_id')
        .selectAll()
        .orderBy('posttop.listened.listened_at', 'desc')
        .limit(limit)
        .execute();
}