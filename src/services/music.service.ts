import { insertArtist } from "../database/queries/artist.queries";
import { insertFilter } from "../database/queries/filter.queries";
import { insertCategories, insertCategoriesToVideo } from "../database/queries/genre.queries";
import { fetchLatestMusic, fetchTopMusic, insertMusicWatched } from "../database/queries/music.queries";
import { insertVideo, fetchVideo, insertSingleMetadata, fetchIsMusic } from "../database/queries/video.queries";
import { YouTubeApiResponse } from "../interface/youtube";
import { convertYoutubeVideoDetails, getYoutubeVideoDetails } from "./youtube.service";

export async function listenedToMusic(watchID: string, userID: number) {
  const videoID = await getOrFetchVideo(watchID);

  if ((await fetchIsMusic(videoID)) == null) {
    return false;
  }

  await insertMusicWatched(videoID, userID);
  return true;
}


export async function getOrFetchVideo(watchID: string) {
  const exists = await fetchVideo(watchID);
  if (exists) {
    return exists.id;
  }
  const yt_video_details = await getYoutubeVideoDetails(watchID);
  const ID = await addNewVideoToDatabase(yt_video_details);
  return ID;
}

export async function getLatestMusic(limit: number = 10) {
  return fetchLatestMusic(limit);
}

export async function getTopMusic(from: Date, to: Date, limit: number = 10) {
  return fetchTopMusic(limit, from, to);
}

export async function filterMusic(watchID: string) {
  await insertFilter(watchID);
}

// TODO: do this in a transaction
async function addNewVideoToDatabase(yt_video_details: YouTubeApiResponse) {
  const data = convertYoutubeVideoDetails(yt_video_details);
  const insertedArtist = await insertArtist(data.channelId, data.channelTitle);
  const categoriesID = await insertCategories(data.topicCategories);
  const defaultLanguage = data.defaultLanguage || data.defaultAudioLanguage || "undefined";
  const videoID = await insertVideo(
    data.id,
    insertedArtist!.id,
    data.duration,
    data.categoryId,
    defaultLanguage
  );
  await insertCategoriesToVideo(videoID!.id, categoriesID.map((i) => i.id));
  await insertSingleMetadata(videoID!.id, defaultLanguage, data.title, data.description);
  for (const [lang, localization] of Object.entries(data.localizations)) {
    if (lang === defaultLanguage) continue;
    await insertSingleMetadata(videoID!.id, lang, localization.title, localization.description);
  }
  return videoID!.id;
}

