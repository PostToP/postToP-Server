import { DatabaseManager } from "..";

export async function insertFilter(videoID: string) {
    const db = DatabaseManager.getInstance();
    // TODO
    return [];
    // return db.insertInto('filter')
    //     .values({ videoID })
    //     .onConflict((oc) => oc.doNothing())
    //     .execute();
}