import { fetchTopGenres } from "../model/db";

export function getTopGenres(from: Date, to: Date, limit: number = 10) {
  return fetchTopGenres(limit, from, to);
}
