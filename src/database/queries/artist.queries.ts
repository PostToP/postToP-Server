import { DatabaseManager } from "..";

export function fetchTopArtists(limit: number = 5, from: Date, to: Date) {
    const db = DatabaseManager.getInstance();

    return db.selectFrom('video')
        .select(['artistID', db.fn.count('artistID').as('times')])
        .innerJoin('watched', 'video.ID', 'watched.musicID')
        .where('watched.datetime', '>=', from.toISOString())
        .where('watched.datetime', '<=', to.toISOString())
        .groupBy('artistID')
        .orderBy('times', 'desc')
        .limit(limit)
        .execute();
}