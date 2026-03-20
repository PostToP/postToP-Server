import {MusicQueries} from "../database/queries/music.queries";
import { UserQueries } from "../database/queries/user.queries";
import {VideoQueries} from "../database/queries/video.queries";
import type {VideoID} from "../model/override";
import {GenreAiService, IsMusicAiService, NERAIService} from "./ai.service";
import {VideoService} from "./video.service";

export class MusicService {
  static async recordListened(watchID: string, userID: number) {
    const videoID = await VideoService.getOrFetch(watchID);

    if ((await MusicService.getVideoIsMusic(videoID)) == null) {
      return false;
    }

    const exists = await UserQueries.fetchBy(userID, "id");
    if (!exists) {
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

  static async getEntitiesInMusic(db_id: VideoID) {
    const ner_entries_ai = await NERAIService.getOrFetch(db_id);
    return ner_entries_ai;
  }

  static async getGenres(db_id: VideoID) {
    const genre_ai = await GenreAiService.getOrFetch(db_id);
    return genre_ai;
  }
}
