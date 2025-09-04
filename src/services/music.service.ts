import { DatabaseManager } from "../database";
import { ArtistQueries } from "../database/queries/artist.queries";
import { CategoryQueries } from "../database/queries/genre.queries";
import { MusicQueries } from "../database/queries/music.queries";
import { QueryForAllParams, VideoQueries } from "../database/queries/video.queries";
import { YouTubeApiResponse } from "../interface/youtube";
import { getOrFetchAiIsMusic } from "./ai.service";
import { convertYoutubeVideoDetails, getYoutubeVideoDetails } from "./youtube.service";

export async function listenedToMusic(watchID: string, userID: number) {
  const videoID = await getOrFetchVideo(watchID);

  if ((await getVideoIsMusic(videoID)) == null) {
    return false;
  }

  await MusicQueries.insertWatched(videoID, userID);
  return true;
}


export async function getOrFetchVideo(watchID: string) {
  const exists = await VideoQueries.fetch(watchID);
  if (exists) {
    return exists.id;
  }
  const yt_video_details = await getYoutubeVideoDetails(watchID);
  const ID = await addNewVideoToDatabase(yt_video_details);
  return ID;
}

async function addNewVideoToDatabase(yt_video_details: YouTubeApiResponse) {
  const data = convertYoutubeVideoDetails(yt_video_details);
  const db = DatabaseManager.getInstance();

  return db.transaction().execute(async (trx) => {
    const insertedArtist = await ArtistQueries.insert(trx, data.channelId, data.channelTitle);
    const categoriesID = await CategoryQueries.insert(trx, data.topicCategories);
    const defaultLanguage = data.defaultLanguage || data.defaultAudioLanguage || "undefined";
    const videoID = await VideoQueries.insert(
      trx,
      data.id,
      insertedArtist!.id,
      data.duration,
      data.categoryId,
      defaultLanguage
    );
    await CategoryQueries.insertToVideo(trx, videoID!.id, categoriesID.map((i) => i.id));
    await VideoQueries.insertMetadata(trx, videoID!.id, defaultLanguage, data.title, data.description);
    for (const [lang, localization] of Object.entries(data.localizations)) {
      if (lang === defaultLanguage) continue;
      await VideoQueries.insertMetadata(trx, videoID!.id, lang, localization.title, localization.description);
    }
    return videoID!.id;
  });
}

export async function addUserReview(videoID: string, userID: number, is_music: boolean) {
  const db_id = await VideoQueries.fetch(videoID);
  if (!db_id) {
    throw new Error("Video not found");
  }
  const review = await VideoQueries.insertIsMusic(db_id.id, userID, is_music);
  return review;
}

export async function getAllVideos(params: QueryForAllParams) {
  const limit = params.limit || 20;
  const videos = await VideoQueries.fetchAll(params);
  const numberOfVideos = await VideoQueries.numberOfVideos(params);
  const pages = Math.ceil(numberOfVideos / limit);
  return {
    videos,
    pagination: {
      totalVideos: numberOfVideos,
      totalPages: pages,
    }
  };
}

export async function getVideoIsMusic(db_id: string) {
  const is_music_admin = await VideoQueries.fetchIsMusicByAdmin(db_id);
  if (is_music_admin) {
    return {
      is_music: is_music_admin.is_music,
      reviewed: true,
    }
  }
  const is_music_ai = await getOrFetchAiIsMusic(db_id);
  return {
    is_music: is_music_ai,
    reviewed: false,
  }

}

export async function addNERReview(videoID: string, userID: number, language: string, namedEntities: { NER: string, text: string, start: number, end: number }[]) {
  const db_id = await VideoQueries.fetch(videoID);
  if (!db_id) {
    throw new Error("Video not found");
  }
  const review = await VideoQueries.insertNERReview(db_id.id, userID, language, namedEntities);
  return review;
}