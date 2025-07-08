import { insertFilter } from "../database/queries/filter.queries";
import { insertGenres } from "../database/queries/genre.queries";
import { fetchLatestMusic, fetchTopMusic, insertMusicWatched } from "../database/queries/music.queries";
import { insertVideo, fetchVideo } from "../database/queries/video.queries";
import { IRequestMusic } from "../interface/interface";

export async function listenedToMusic(music: IRequestMusic) {
  const { watchID, artistID } = music;
  const exists = await fetchVideo(watchID);
  if (!exists) {
    const video = await cacheVideo(watchID, artistID);
    if (!video.isMusic) return;
  } else if (!exists.isMusic) return;

  await insertMusicWatched(watchID);
  return;
}

export function getLatestMusic(limit: number = 10) {
  return fetchLatestMusic(limit);
}

export function getTopMusic(from: Date, to: Date, limit: number = 10) {
  return fetchTopMusic(limit, from, to);
}

export async function filterMusic(watchID: string) {
  await insertFilter(watchID);
}

async function cacheVideo(watchID: string, artistID: string): Promise<any> {
  const flags = await pullYTAPIFlags(watchID);
  const isMusic = flags.includes("Music");
  await insertVideo(watchID, artistID, isMusic);
  if (isMusic) {
    const genres = flags.filter((i) => i !== "Music");
    if (genres.length > 0) {
      await insertGenres(watchID, genres);
    }
  }
  return { ID: watchID, artistID, isMusic: isMusic ? 1 : 0 };
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
