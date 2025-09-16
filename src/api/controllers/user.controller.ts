import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';

export async function getUserController(req: Request, res: Response) {
    const userHandle = req.params.handle;
    const query = req.query;
    const type = query.type as 'music' | 'artist' | 'genre';
    const startDate = query.startDate ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate ? new Date(query.endDate as string) : undefined;

    if (startDate && isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid startDate format" });
    }
    if (endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid endDate format" });
    }

    switch (type) {
        case 'music':
            const topMusic = await UserService.getTopMusic(userHandle, startDate, endDate);
            return res.status(200).json(topMusic);
        case 'artist':
            const topArtists = await UserService.getTopArtists(userHandle, startDate, endDate);
            return res.status(200).json(topArtists);
        case 'genre':
            const topGenres = await UserService.getTopGenres(userHandle, startDate, endDate);
            return res.status(200).json(topGenres);
        default:
            return res.status(400).json({ error: "Invalid type parameter" });
    }
}