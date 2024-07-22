import { IRequestMusic } from "../interface/interface.ts";
import { fetchLatestMusic, fetchTopMusic, insertMusic } from "../model/db.ts";

export function InsertNewMusic(music: IRequestMusic) {
  const { watchID, artistID } = music;
  return insertMusic(watchID, artistID);
}

export function getLatestMusic(
  from: Date = new Date(),
  to: Date = new Date(),
  limit: number = 10
) {
  return fetchLatestMusic(limit, from, to);
}

export function getTopMusic(from: Date, to: Date, limit: number = 10) {
  return fetchTopMusic(limit, from, to);
}
