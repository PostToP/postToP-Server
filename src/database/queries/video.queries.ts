import { DatabaseManager } from "..";

export async function fetchVideo(videoID: string) {
    const db = DatabaseManager.getInstance();
    return db
        .selectFrom('posttop.video')
        .selectAll()
        .where('yt_id', '=', videoID)
        .executeTakeFirst();
}

export async function insertVideo(
    videoID: string,
    artistID: number,
    duration: number,
    main_category_id: number,
    default_language: string,
) {
    const db = DatabaseManager.getInstance();

    const exists = await db
        .selectFrom('posttop.video')
        .select('id')
        .where('yt_id', '=', videoID)
        .executeTakeFirst();

    if (exists) {
        return exists;
    }


    return db.insertInto('posttop.video')
        .values({
            yt_id: videoID,
            channel_id: artistID,
            duration: duration,
            main_category_id: main_category_id,
            default_language: default_language,
        })
        .onConflict((oc) => oc.doNothing())
        .returning('id')
        .executeTakeFirst();
}



export async function insertSingleMetadata(id: string, language: string, title: string, description: string) {
    const db = DatabaseManager.getInstance();
    return db
        .insertInto('posttop.video_metadata')
        .values({ video_id: id, language, title, description })
        .onConflict((oc) => oc.doNothing())
        .execute();
}


export async function fetchIsMusic(videoID: string) {
    const db = DatabaseManager.getInstance();
    return db
        .selectFrom('posttop.video_category')
        .innerJoin('posttop.video', 'posttop.video_category.video_id', 'posttop.video.id')
        .innerJoin('posttop.category', 'posttop.video_category.category_id', 'posttop.category.id')
        .where("name", "=", "https://en.wikipedia.org/wiki/Music")
        .where('posttop.video.id', '=', videoID)
        .selectAll()
        .executeTakeFirst();
}


export async function fetchVideoDataAll(videoID: string) {
    const db = DatabaseManager.getInstance();
    return db
        .selectFrom('posttop.video')
        .innerJoin('posttop.video_metadata',
            (join) => join
                .onRef('posttop.video.id', '=', 'posttop.video_metadata.video_id')
                .onRef('posttop.video.default_language', '=', 'posttop.video_metadata.language'))
        .innerJoin('posttop.channel as channel', 'posttop.video.channel_id', 'channel.id')
        .selectAll()
        .where('posttop.video.id', '=', videoID)
        .executeTakeFirst();
}