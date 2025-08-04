import { DatabaseManager } from "..";

export class VideoQueries {
    static async fetch(videoID: string) {
        const db = DatabaseManager.getInstance();
        return db
            .selectFrom('posttop.video')
            .selectAll()
            .where('yt_id', '=', videoID)
            .executeTakeFirst();
    }

    static async insert(
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

    static async insertMetadata(id: string, language: string, title: string, description: string) {
        const db = DatabaseManager.getInstance();
        return db
            .insertInto('posttop.video_metadata')
            .values({ video_id: id, language, title, description })
            .onConflict((oc) => oc.doNothing())
            .execute();
    }


    static async fetchIsMusicByAdmin(videoID: string) {
        const db = DatabaseManager.getInstance();
        return db
            .selectFrom('posttop.is_music_video')
            .where('video_id', '=', videoID)
            .where('submitted_by_id', 'in', db.selectFrom('posttop.user_role').innerJoin('posttop.role', 'posttop.user_role.role_id', 'posttop.role.id').select('user_id').where('posttop.role.name', '=', 'Admin'))
            .selectAll()
            .executeTakeFirst();
    }

    static async fetchIsMusicByAI(videoID: string) {
        const db = DatabaseManager.getInstance();
        return db
            .selectFrom('posttop.is_music_video')
            .where('video_id', '=', videoID)
            .where('submitted_by_id', 'in', db.selectFrom('posttop.user_role').innerJoin('posttop.role', 'posttop.user_role.role_id', 'posttop.role.id').select('user_id').where('posttop.role.name', '=', 'ai'))
            .selectAll()
            .executeTakeFirst();
    }

    // TODO: remove this after AI implemented
    static async fetchIsMusicByCategory(videoID: string) {
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

    static async insertIsMusic(videoID: string, userID: number, is_music: boolean) {
        const db = DatabaseManager.getInstance();
        return db
            .insertInto('posttop.is_music_video')
            .values({
                video_id: videoID,
                submitted_by_id: userID,
                is_music: is_music,
            })
            .onConflict((oc) => oc.doNothing())
            .execute();
    }

    static async fetchDataAll(videoID: string) {
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
}