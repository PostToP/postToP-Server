import type {Request, Response} from "express";
import {z} from "zod";
import {UserService} from "../../services/user.service";

const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

const QuerySchema = z.object({
  type: z.enum(["music", "artist", "genre"]),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  ...paginationSchema.shape,
});

export async function getUserStatisticsController(req: Request, res: Response) {
  const userHandle = req.params.handle;
  const {type, startDate, endDate, limit, offset} = QuerySchema.parse(req.query);

  switch (type) {
    case "music": {
      const topMusic = await UserService.getTopMusic(userHandle, startDate, endDate, limit, offset);
      return res.status(200).json(topMusic);
    }
    case "artist": {
      const topArtists = await UserService.getTopArtists(userHandle, startDate, endDate, limit, offset);
      return res.status(200).json(topArtists);
    }
    case "genre": {
      const topGenres = await UserService.getTopGenres(userHandle, startDate, endDate, limit, offset);
      return res.status(200).json(topGenres);
    }
  }
}

const UserHistoryParamsSchema = z.object({
  ...paginationSchema.shape,
});

export async function getUserHistoryController(req: Request, res: Response) {
  const userHandle = req.params.handle;
  const filters = UserHistoryParamsSchema.parse(req.query);
  const history = await UserService.getUserHistory(userHandle, filters);
  return res.status(200).json(history);
}

const UserStatsParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function getUserStatsController(req: Request, res: Response) {
  const userHandle = req.params.handle;
  const filters = UserStatsParamsSchema.parse(req.query);
  const stats = await UserService.getUserStats(userHandle, filters);
  return res.status(200).json(stats);
}

export async function getUserInfoController(req: Request, res: Response) {
  const userHandle = req.params.handle;
  const userInfo = await UserService.getUserInfo(userHandle);
  return res.status(200).json(userInfo);
}
