import { IRequestMusic } from "../interface/interface.ts";
import { createFilterIfNotExists, insertVideo } from "../model/db.ts";
import {
  fetchLatestMusic,
  fetchTopMusic,
  insertMusicWatched,
  selectVideo,
} from "../model/db.ts";

export async function listenedToMusic(music: IRequestMusic) {
  const { watchID, artistID } = music;
  const { cache, isMusic: musicFlag } = await isMusic(watchID);
  if (!cache) insertVideo(watchID, artistID, musicFlag);
  if (!musicFlag) return;

  insertMusicWatched(watchID);
  return;
}

export function getLatestMusic(limit: number = 10) {
  return fetchLatestMusic(limit);
}

export function getTopMusic(from: Date, to: Date, limit: number = 10) {
  return fetchTopMusic(limit, from, to);
}

export function filterMusic(watchID: string) {
  createFilterIfNotExists(watchID);
}

async function isMusic(watchID: string) {
  const video = selectVideo(watchID);
  if (video) return { cache: true, isMusic: video.isMusic };
  const isMusicFlag = await isMusicAPI(watchID);
  return { cache: false, isMusic: isMusicFlag };
}

async function isMusicAPI(watchID: string) {
  const lemnsolife = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=topicDetails&id=${watchID}&key=${Deno.env.get(
      "YT_API_KEY"
    )}`
  );
  const json = await lemnsolife.json();
  const categories = json.items[0].topicDetails.topicCategories as string[];
  return categories.includes("https://en.wikipedia.org/wiki/Music");
}
