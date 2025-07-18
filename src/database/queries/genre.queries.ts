import { DatabaseManager } from "..";

export async function insertCategoriesToVideo(videoID: string, genres: number[]) {
    const db = DatabaseManager.getInstance();
    db.insertInto('posttop.video_category')
        .values(genres.map((genre) => ({
            video_id: videoID,
            category_id: genre,
        })))
        .onConflict((oc) => oc.doNothing())
        .execute();
}

export async function insertCategories(categories: string[]) {
    const db = DatabaseManager.getInstance();

    const exists = await db.selectFrom('posttop.category')
        .select('id')
        .where('name', 'in', categories)
        .execute();

    if (exists.length > 0) {
        return exists;
    }


    return db.insertInto('posttop.category')
        .values(categories.map((category) => ({ name: category })))
        .onConflict((oc) => oc.doNothing())
        .returning('id')
        .execute();
}

export async function fetchTopGenres(limit: number = 5, from: Date, to: Date) {
    const db = DatabaseManager.getInstance();

    return db.selectFrom('posttop.category')
        .select(['posttop.category.id as genreID', db.fn.count('posttop.video_category.category_id').as('times')])
        .innerJoin('posttop.video_category', 'posttop.category.id', 'posttop.video_category.category_id')
        .innerJoin('posttop.video', 'posttop.video_category.video_id', 'posttop.video.id')
        .innerJoin('posttop.listened', 'posttop.video.id', 'posttop.listened.video_id')
        .where('posttop.listened.listened_at', '>=', from)
        .where('posttop.listened.listened_at', '<=', to)
        .groupBy('posttop.category.id')
        .orderBy('times', 'desc')
        .limit(limit)
        .execute();
}