import {DatabaseManager} from "../database";
import {ArtistQueries} from "../database/queries/artist.queries";
import {CategoryQueries} from "../database/queries/genre.queries";
import {type QueryForAllParams, VideoQueries} from "../database/queries/video.queries";
import type {YouTubeApiResponse} from "../interface/youtube";
import {GoogleService} from "./google.service";
import {YouTubeService} from "./youtube.service";

export class VideoService {
  static async getOrFetch(watchID: string, userID: number) {
    const exists = await VideoQueries.fetch(watchID);
    if (exists) {
      return exists.id;
    }
    const userAccessToken = await GoogleService.getAccessToken(userID);
    const yt_video_details = await YouTubeService.fetchVideoDetails(watchID, userAccessToken);
    const ID = await VideoService.addToDatabase(yt_video_details);
    return ID;
  }

  static async getAll(params: QueryForAllParams) {
    const limit = params.limit || 20;
    const videos = await VideoQueries.fetchAll(params);
    const numberOfVideos = await VideoQueries.numberOfVideos(params);
    const pages = Math.ceil(numberOfVideos / limit);
    return {
      videos,
      pagination: {
        totalVideos: numberOfVideos,
        totalPages: pages,
      },
    };
  }

  private static async addToDatabase(yt_video_details: YouTubeApiResponse) {
    const data = YouTubeService.convertDetails(yt_video_details);
    const db = DatabaseManager.getInstance();

    return db.transaction().execute(async trx => {
      const insertedArtist = await ArtistQueries.insert(trx, data.channelId, data.channelTitle);
      if (!insertedArtist) {
        throw new Error("Failed to insert or fetch artist");
      }
      const categoriesID = await CategoryQueries.insert(trx, data.topicCategories);
      const defaultLanguage = data.defaultLanguage || data.defaultAudioLanguage || "undefined";
      const videoID = await VideoQueries.insert(
        trx,
        data.id,
        insertedArtist.id,
        data.duration,
        data.categoryId,
        defaultLanguage,
      );
      if (!videoID) {
        throw new Error("Failed to insert or fetch video");
      }
      await CategoryQueries.insertToVideo(
        trx,
        videoID.id,
        categoriesID.map(i => i.id),
      );
      await VideoQueries.insertMetadata(trx, videoID.id, defaultLanguage, data.title, data.description);
      for (const [lang, localization] of Object.entries(data.localizations)) {
        if (lang === defaultLanguage) continue;
        await VideoQueries.insertMetadata(trx, videoID.id, lang, localization.title, localization.description);
      }
      return videoID.id;
    });
  }
}
