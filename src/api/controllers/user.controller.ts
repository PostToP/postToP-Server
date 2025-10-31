import type {Request, Response} from "express";
import {z} from "zod";
import {UserService} from "../../services/user.service";

const QuerySchema = z.object({
  type: z.enum(["music", "artist", "genre"]),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function getUserController(req: Request, res: Response) {
  const userHandle = req.params.handle;
  const {type, startDate, endDate} = QuerySchema.parse(req.query);

  switch (type) {
    case "music": {
      const topMusic = await UserService.getTopMusic(userHandle, startDate, endDate);
      return res.status(200).json(topMusic);
    }
    case "artist": {
      const topArtists = await UserService.getTopArtists(userHandle, startDate, endDate);
      return res.status(200).json(topArtists);
    }
    case "genre": {
      const topGenres = await UserService.getTopGenres(userHandle, startDate, endDate);
      return res.status(200).json(topGenres);
    }
    default:
      return res.status(400).json({error: "Invalid type parameter"});
  }
}
