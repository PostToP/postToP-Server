import type {Request, Response} from "express";
import {z} from "zod";
import {UserService} from "../../services/user.service";
import { AuthenticatedRequest } from "../../types/express";
import { UserQueries } from "../../database/queries/user.queries";

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

const UpdateUserInfoSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(1).optional(),
  handle: z.string().min(1).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(1).optional(),
});

export async function updateUserInfoController(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userHandle = req.params.handle;
  const updateData = UpdateUserInfoSchema.parse(req.body);

  const user = await UserQueries.fetchBy(userHandle, "handle");

  if (user?.id !== userReq.userID) {
    return res.status(403).json({message: "You can only update your own information"});
  }

  if (updateData.newPassword && !updateData.currentPassword) {
    return res.status(400).json({message: "Current password is required to set a new password"});
  }

  await UserService.updateUserInfo(userHandle, updateData);
  return res.status(200).json({message: "User information updated successfully"});
}