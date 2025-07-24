import { insertArtist } from "../database/queries/artist.queries";
import { insertFilter } from "../database/queries/filter.queries";
import { insertCategories, insertCategoriesToVideo } from "../database/queries/genre.queries";
import { fetchLatestMusic, fetchTopMusic, insertMusicWatched } from "../database/queries/music.queries";
import { insertVideo, fetchVideo, insertSingleMetadata, fetchIsMusic } from "../database/queries/video.queries";
import { IRequestMusic } from "../interface/interface";
import { YouTubeApiResponse } from "../interface/youtube";
import { logger } from "../utils/logger";

export async function listenedToMusic(music: IRequestMusic, userID: number) {
  const { watchID } = music;
  const exists = await fetchVideo(watchID);
  let ID = exists?.id;
  if (!exists) {
    const yt_video_details = await getYoutubeVideoDetails(watchID);
    if (!yt_video_details) {
      logger.error(`Failed to fetch YouTube video details for ${watchID}`);
      return;
    }
    ID = await addNewVideoToDatabase(yt_video_details);
  }
  if (!ID) {
    logger.error(`Failed to insert or fetch video ID for ${watchID}`);
    return;
  }
  if ((await fetchIsMusic(ID)) == null) {
    return;
  }

  await insertMusicWatched(ID, userID);
  return;
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

function convertDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return 0;
  }
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) :
    0;
  const seconds = match[3] ? parseInt(match[3], 10) :
    0;
  return hours * 3600 + minutes * 60 + seconds;
}

async function addNewVideoToDatabase(yt_video_details: YouTubeApiResponse) {
  const artistID = await insertArtist(yt_video_details.items[0].snippet.channelId, yt_video_details.items[0].snippet.channelTitle);
  if (!artistID) {
    logger.error(`Failed to insert artist: ${yt_video_details.items[0].snippet.channelId}`);
    return;
  }
  const categoriesID = await insertCategories(yt_video_details.items[0].topicDetails.topicCategories);
  const videoID = await insertVideo(
    yt_video_details.items[0].id,
    artistID.id,
    convertDuration(yt_video_details.items[0].contentDetails.duration),
    Number(yt_video_details.items[0].snippet.categoryId),
    yt_video_details.items[0].snippet.defaultAudioLanguage || "en"
  );
  if (!videoID) {
    logger.error(`Failed to insert video: ${yt_video_details.items[0].id}`);
    return;
  }
  await insertCategoriesToVideo(videoID.id, categoriesID.map((i) => i.id));
  const item = yt_video_details.items[0];
  const languages = item.localizations || {};
  const defaultLanguage = item.snippet.defaultLanguage || item.snippet.defaultAudioLanguage || "undefined";
  const defaultTitle = item.snippet.title;
  const defaultDescription = item.snippet.description;
  await insertSingleMetadata(videoID.id, defaultLanguage, defaultTitle, defaultDescription);
  for (const [lang, localization] of Object.entries(languages)) {
    if (lang === defaultLanguage) continue;
    await insertSingleMetadata(videoID.id, lang, localization.title, localization.description);
  }
  return videoID.id;
}



async function getYoutubeVideoDetails(videoId: string): Promise<YouTubeApiResponse | null> {
  const baseUrl = "https://youtube.googleapis.com/youtube/v3/videos";
  const params = new URLSearchParams({
    part: "snippet,topicDetails,localizations,contentDetails",
    id: videoId,
    key: process.env.YT_API_KEY || "TODO"
  });
  const url = `${baseUrl}?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as YouTubeApiResponse;
    return data;
  } catch (error) {
    logger.error('Error fetching YouTube video details:', error);
    return null;
  }
}