import {DatabaseManager} from "..";

export class MusicQueries {
  static async insertWatched(musicID: string, userID: number) {
    const db = DatabaseManager.getInstance();
    return db
      .insertInto("posttop.listened")
      .values({video_id: musicID, user_id: userID, listened_at: new Date().toISOString()})
      .onConflict(oc => oc.doNothing())
      .execute();
  }
}
