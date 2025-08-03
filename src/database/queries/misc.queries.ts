import { DatabaseManager } from "..";

export class MiscQueries {
    static async fetchAll() {
        const db = DatabaseManager.getInstance();

        const videos = await db.selectFrom('posttop.video')
            .innerJoin('posttop.main_category', 'posttop.video.main_category_id', 'posttop.main_category.id')
            .innerJoin('posttop.channel', 'posttop.video.channel_id', 'posttop.channel.id')
            .leftJoin(
                db.selectFrom('posttop.video_category')
                    .leftJoin('posttop.category', 'posttop.video_category.category_id', 'posttop.category.id')
                    .select([
                        'posttop.video_category.video_id',
                        db.fn
                            .agg('json_agg', ['posttop.category.name'])
                            .filterWhere('posttop.category.name', 'is not', null)
                            .as('categories')
                    ])
                    .groupBy('posttop.video_category.video_id')
                    .as('cat_agg'),
                'posttop.video.id',
                'cat_agg.video_id'
            )
            .select(['posttop.video.yt_id', 'posttop.video.duration', 'posttop.channel.name as channel_name', 'posttop.main_category.name as main_category_name', 'cat_agg.categories'])
            .execute();

        const watched = await db.selectFrom('posttop.listened')
            .selectAll()
            .execute();

        return { videos, watched };
    }
}