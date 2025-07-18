import { fetchTopArtists } from "../database/queries/artist.queries";

export async function getTopArtists(from: Date, to: Date, limit: number = 10) {
  return fetchTopArtists(limit, from, to);
}
