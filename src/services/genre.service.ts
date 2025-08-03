import { CategoryQueries } from "../database/queries/genre.queries";

export async function getTopGenres(from: Date, to: Date, limit: number = 10) {
  return CategoryQueries.fetchTop(limit, from, to);
}
