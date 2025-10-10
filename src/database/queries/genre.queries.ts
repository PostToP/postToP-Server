import type {Transaction} from "kysely";
import type {DB} from "../../model/db";
import type {VideoID} from "../../model/override";

export class CategoryQueries {
  static async insertToVideo(trx: Transaction<DB>, videoID: VideoID, categoryIds: number[]) {
    if (!categoryIds || categoryIds.length === 0) return;

    trx
      .insertInto("video_category")
      .values(
        categoryIds.map(genre => ({
          video_id: videoID,
          category_id: genre,
        })),
      )
      .onConflict(oc => oc.doNothing())
      .execute();
  }

  static async insert(trx: Transaction<DB>, categoryNames: string[]) {
    if (!categoryNames || categoryNames.length === 0) return [];

    const exists = await trx
      .selectFrom("category")
      .select("id")
      .where("name", "in", categoryNames || [])
      .execute();

    if (exists.length > 0) return exists;

    return trx
      .insertInto("category")
      .values(categoryNames.map(category => ({name: category})))
      .onConflict(oc => oc.doNothing())
      .returning("id")
      .execute();
  }
}
