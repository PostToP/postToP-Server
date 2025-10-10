import type {VideoID} from "../../model/override";
import {DatabaseManager} from "..";

export class MusicQueries {
  static async insertWatched(musicID: VideoID, userID: number) {
    const db = DatabaseManager.getInstance();
    return db
      .insertInto("listened")
      .values({video_id: musicID, user_id: userID, listened_at: new Date().toISOString()})
      .onConflict(oc => oc.doNothing())
      .execute();
  }
}
