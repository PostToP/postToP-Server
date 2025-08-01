import { fetchTopGenres } from "../database/queries/genre.queries";

export async function getTopGenres(from: Date, to: Date, limit: number = 10) {
  return fetchTopGenres(limit, from, to);
}
