import { fetchTopGenres } from "../database";

export function getTopGenres(from: Date, to: Date, limit: number = 10) {
  return fetchTopGenres(limit, from, to);
}
