import { ArtistQueries } from "../database/queries/artist.queries";
import { CategoryQueries } from "../database/queries/genre.queries";
import { MusicQueries } from "../database/queries/music.queries";
import { VideoQueries } from "../database/queries/video.queries";
import { YouTubeApiResponse } from "../interface/youtube";
import { convertYoutubeVideoDetails, getYoutubeVideoDetails } from "./youtube.service";

export async function listenedToMusic(watchID: string, userID: number) {
  const videoID = await getOrFetchVideo(watchID);

  if ((await VideoQueries.fetchIsMusic(videoID)) == null) {
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

export async function getLatestMusic(limit: number = 10) {
  return MusicQueries.fetchLatest(limit);
}

export async function getTopMusic(from: Date, to: Date, limit: number = 10) {
  return MusicQueries.fetchTop(limit, from, to);
}

// TODO: do this in a transaction
async function addNewVideoToDatabase(yt_video_details: YouTubeApiResponse) {
  const data = convertYoutubeVideoDetails(yt_video_details);
  const insertedArtist = await ArtistQueries.insert(data.channelId, data.channelTitle);
  const categoriesID = await CategoryQueries.insert(data.topicCategories);
  const defaultLanguage = data.defaultLanguage || data.defaultAudioLanguage || "undefined";
  const videoID = await VideoQueries.insert(
    data.id,
    insertedArtist!.id,
    data.duration,
    data.categoryId,
    defaultLanguage
  );
  await CategoryQueries.insertToVideo(videoID!.id, categoriesID.map((i) => i.id));
  await VideoQueries.insertMetadata(videoID!.id, defaultLanguage, data.title, data.description);
  for (const [lang, localization] of Object.entries(data.localizations)) {
    if (lang === defaultLanguage) continue;
    await VideoQueries.insertMetadata(videoID!.id, lang, localization.title, localization.description);
  }
  return videoID!.id;
}

export async function addUserReview(videoID: string, userID: number, is_music: boolean) {
  const db_id = await VideoQueries.fetch(videoID);
  if (!db_id) {
    throw new Error("Video not found");
  }
  const review = await VideoQueries.insertIsMusic(db_id.id, userID, is_music);
  return review;
}