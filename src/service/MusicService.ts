import { IRequestMusic } from "../interface/interface";
import {
  createFilterIfNotExists,
  insertGenres,
  insertVideo,
  IVideo,
} from "../model/db";
import {
  fetchLatestMusic,
  fetchTopMusic,
  insertMusicWatched,
  selectVideo,
} from "../model/db";

export async function listenedToMusic(music: IRequestMusic) {
  const { watchID, artistID } = music;
  const exists = await selectVideo(watchID);
  if (!exists) {
    const isMusic = await cacheVideo(watchID, artistID);
    if (!isMusic) return;
  } else if (!exists.isMusic) return;

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

async function cacheVideo(watchID: string, artistID: string): Promise<IVideo> {
  const flags = await pullYTAPIFlags(watchID);
  const isMusic = flags.includes("Music");
  insertVideo(watchID, artistID, isMusic);
  if (isMusic) {
    const genres = flags.filter((i) => i !== "Music");
    if (genres.length == 0) return { ID: watchID, artistID, isMusic };
    insertGenres(watchID, genres);
  }
  return { ID: watchID, artistID, isMusic };
}

async function pullYTAPIFlags(watchID: string) {
  const lemnsolife = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=topicDetails&id=${watchID}&key=${process.env.YT_API_KEY}`
  );
  const json = await lemnsolife.json();
  let categories = json.items[0]?.topicDetails?.topicCategories as string[];
  if (!categories) return [];
  categories = categories.map((i) =>
    i.replace("https://en.wikipedia.org/wiki/", "").replace("_", " ")
  );
  return categories;
}
