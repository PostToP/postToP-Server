import { Request, Response } from 'express';
import { getAllVideos } from '../../services/music.service';

export async function getVideosController(req: Request, res: Response) {
    const query = req.query;

    const limit = parseInt(query.limit as string) || 10;
    const page = parseInt(query.page as string) || 0;
    const sortBy = query.sortBy as string || 'alphabetical';
    const reverse = query.reverse === 'true';
    const onlyUnreviewed = query.onlyUnreviewed === 'true';

    // TODO validate query parameters

    try {
        const reviews = await getAllVideos({ limit, page, sortBy, reverse, onlyUnreviewed });
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}