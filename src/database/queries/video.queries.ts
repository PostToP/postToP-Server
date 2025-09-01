import { sql, Transaction } from "kysely";
import { DatabaseManager } from "..";
import { DB } from "../../model/db";

export class VideoQueries {
    static async fetch(videoID: string) {
        const db = DatabaseManager.getInstance();
        return db
            .selectFrom('posttop.video')
            .selectAll()
            .where('yt_id', '=', videoID)
            .executeTakeFirst();
    }

    static async fetchAiData(id: string) {
        const db = DatabaseManager.getInstance();

        return db
            .selectFrom('posttop.video')
            .innerJoin('posttop.video_metadata',
                (join) => join
                    .onRef('posttop.video.id', '=', 'posttop.video_metadata.video_id')
                    .onRef('posttop.video_metadata.language', '=', 'posttop.video.default_language'))
            .innerJoin('posttop.channel as channel', 'posttop.video.channel_id', 'channel.id')
            .leftJoin((qb) => {
                return qb
                    .selectFrom('posttop.video_category')
                    .innerJoin('posttop.category', 'posttop.video_category.category_id', 'posttop.category.id')
                    .select([sql`array_agg(posttop.category.name)`.as('categories'), 'posttop.video_category.video_id'])
                    .groupBy('posttop.video_category.video_id')
                    .as('categories');
            }, (join) => join.onRef('posttop.video.id', '=', 'categories.video_id'))
            .selectAll()
            .where('posttop.video.id', '=', id)
            .executeTakeFirst();
    }

    static async insert(
        trx: Transaction<DB>,
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

    static async insertMetadata(trx: Transaction<DB>, id: string, language: string, title: string, description: string) {
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

    private static async getQueryForAll(limit: number, page: number, sortBy: string, reverse: boolean, onlyUnreviewed: boolean) {
        const db = DatabaseManager.getInstance();
        let query = db
            .selectFrom('posttop.video')
            .innerJoin('posttop.video_metadata',
                (join) => join
                    .onRef('posttop.video.id', '=', 'posttop.video_metadata.video_id')
                    .onRef('posttop.video.default_language', '=', 'posttop.video_metadata.language'))
            .leftJoin('posttop.is_music_video', 'posttop.video.id', 'posttop.is_music_video.video_id');

        if (sortBy) {
            const columns = {
                "alphabetical": sql`posttop.video_metadata.title`,
                "duration": sql`posttop.video.duration`,
                "date": sql`posttop.video.created_at`,
                "random": sql`random()`,
            };

            query = query.orderBy(columns[sortBy as keyof typeof columns], reverse ? 'desc' : 'asc');
        }

        if (onlyUnreviewed) {
            query = query.where('posttop.is_music_video.video_id', 'is', null);
        }

        query = query.limit(limit).offset(page * limit);

        return query;
    }

    static async fetchAll(limit: number, page: number, sortBy: string, reverse: boolean, onlyUnreviewed: boolean) {
        const query = await this.getQueryForAll(limit, page, sortBy, reverse, onlyUnreviewed);
        return query.selectAll().execute();
    }

    static async numberOfVideos(limit: number, page: number, sortBy: string, reverse: boolean, onlyUnreviewed: boolean) {
        const query = await this.getQueryForAll(limit, page, sortBy, reverse, onlyUnreviewed);
        const totalCount = await query.select((eb) => [
            sql`count(*)`.as('total_count'),
        ]).executeTakeFirstOrThrow();
        return totalCount.total_count as number;
    }
}