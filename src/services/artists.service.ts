import { fetchTopArtists } from "../database";

export function getTopArtists(from: Date, to: Date, limit: number = 10) {
  return fetchTopArtists(limit, from, to);
}
