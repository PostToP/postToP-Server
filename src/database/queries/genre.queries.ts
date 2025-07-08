import { DatabaseManager } from "..";

export async function insertGenres(videoID: string, genres: string[]) {
    const db = DatabaseManager.getInstance();
    return db
        .insertInto('video_genre')
        .values(genres.map((genre) => ({
            videoID,
            genre,
        })))
        .onConflict((oc) => oc.doNothing())
        .execute();
}

export function fetchTopGenres(limit: number = 5, from: Date, to: Date) {
    const db = DatabaseManager.getInstance();

    return db.selectFrom('video_genre')
        .select(['genre', db.fn.count('genre').as('times')])
        .innerJoin('watched', 'video_genre.videoID', 'watched.musicID')
        .where('watched.datetime', '>=', from.toISOString())
        .where('watched.datetime', '<=', to.toISOString())
        .groupBy('genre')
        .orderBy('times', 'desc')
        .limit(limit)
        .execute();
}