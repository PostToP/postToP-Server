import { fetchTopArtists } from "../model/db";

export function getTopArtists(from: Date, to: Date, limit: number = 10) {
  return fetchTopArtists(limit, from, to);
}
