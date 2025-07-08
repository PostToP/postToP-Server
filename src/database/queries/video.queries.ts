import { DatabaseManager } from "..";

export async function fetchVideo(videoID: string) {
    const db = DatabaseManager.getInstance();
    return db
        .selectFrom('video')
        .selectAll()
        .where('ID', '=', videoID)
        .executeTakeFirst();
}

export async function insertVideo(
    videoID: string,
    artistID: string,
    isMusic: boolean
) {
    const db = DatabaseManager.getInstance();
    return db
        .insertInto('video')
        .values({ ID: videoID, artistID, isMusic: isMusic ? 1 : 0 })
        .onConflict((oc) => oc.doNothing())
        .execute();
}