import type { Transaction } from "kysely";
import type { DB } from "../../model/db";

export class CategoryQueries {
  static async insertToVideo(trx: Transaction<DB>, videoID: string, genres: number[]) {
    if (!genres || genres.length === 0) return;

    trx
      .insertInto("posttop.video_category")
      .values(
        genres.map(genre => ({
          video_id: videoID,
          category_id: genre,
        })),
      )
      .onConflict(oc => oc.doNothing())
      .execute();
  }

  static async insert(trx: Transaction<DB>, categories: string[]) {
    if (!categories || categories.length === 0) return [];

    const exists = await trx
      .selectFrom("posttop.category")
      .select("id")
      .where("name", "in", categories || [])
      .execute();

    if (exists.length > 0) return exists;

    return trx
      .insertInto("posttop.category")
      .values(categories.map(category => ({ name: category })))
      .onConflict(oc => oc.doNothing())
      .returning("id")
      .execute();
  }
}
