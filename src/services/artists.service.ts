import { fetchTopArtists } from "../database/queries/artist.queries";

export function getTopArtists(from: Date, to: Date, limit: number = 10) {
  return fetchTopArtists(limit, from, to);
}
