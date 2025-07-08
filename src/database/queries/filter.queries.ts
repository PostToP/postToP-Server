import { DatabaseManager } from "..";

export async function createFilterIfNotExists(videoID: string) {
    const db = DatabaseManager.getInstance();
    return db.insertInto('filter')
        .values({ videoID })
        .onConflict((oc) => oc.doNothing())
        .execute();
}