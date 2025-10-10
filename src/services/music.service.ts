import {MusicQueries} from "../database/queries/music.queries";
import {VideoQueries} from "../database/queries/video.queries";
import type {VideoID} from "../model/override";
import {IsMusicAiService} from "./ai.service";
import {VideoService} from "./video.service";

export class MusicService {
  static async recordListened(watchID: string, userID: number) {
    const videoID = await VideoService.getOrFetch(watchID, userID);

    if ((await MusicService.getVideoIsMusic(videoID)) == null) {
      return false;
    }

    await MusicQueries.insertWatched(videoID, userID);
    return true;
  }

  static async getVideoIsMusic(db_id: VideoID) {
    const is_music_admin = await VideoQueries.fetchIsMusicByAdmin(db_id);
    if (is_music_admin) {
      return {
        is_music: is_music_admin.is_music,
        reviewed: true,
      };
    }
    const is_music_ai = await IsMusicAiService.getOrFetch(db_id);
    return {
      is_music: is_music_ai,
      reviewed: false,
    };
  }
}
