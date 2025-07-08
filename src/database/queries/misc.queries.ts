import { DatabaseManager } from "..";

export async function all() {
    const db = DatabaseManager.getInstance();
    const watched = await db.selectFrom('watched').selectAll().execute();
    const video = await db.selectFrom('video').selectAll().execute();
    const filter = await db.selectFrom('filter').selectAll().execute();
    const genres = await db.selectFrom('video_genre').selectAll().execute();
    return { watched, video, filter, genres };
}