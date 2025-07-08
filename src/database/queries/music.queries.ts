import { DatabaseManager } from "..";

export async function insertMusicWatched(musicID: string) {
    const db = DatabaseManager.getInstance();
    return db
        .insertInto('watched')
        .values({ musicID, datetime: new Date().toISOString() })
        .onConflict((oc) => oc.doNothing())
        .execute();
}

export function fetchTopMusic(limit: number, from: Date, to: Date) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom('watched')
        .select(['musicID', db.fn.count('musicID').as('times')])
        .where('datetime', '>=', from.toISOString())
        .where('datetime', '<=', to.toISOString())
        .where('musicID', 'not in', db.selectFrom('filter').select('videoID'))
        .groupBy('musicID')
        .orderBy('times', 'desc')
        .limit(limit)
        .execute();
}

export function fetchLatestMusic(limit: number) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom('watched')
        .select('musicID')
        .where('musicID', 'not in', db.selectFrom('filter').select('videoID'))
        .orderBy('datetime', 'desc')
        .limit(limit)
        .execute();
}