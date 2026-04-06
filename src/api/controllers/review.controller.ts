import type {Request, Response} from "express";
import {z} from "zod";
import {ReviewService} from "../../services/review.service";
import type {AuthenticatedRequest} from "../../types/express";

const IsMusicReviewSchema = z.object({
  watchID: z.string().min(1),
  is_music: z.boolean(),
});

export async function postIsMusicReviewRequestHandler(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userID = userReq.userID;
  const {watchID, is_music} = IsMusicReviewSchema.parse(req.body);

  await ReviewService.addIsMusicReview(watchID, userID, is_music);
  return res.status(200).json({message: "Review added successfully"});
}

export async function deleteIsMusicReviewRequestHandler(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userID = userReq.userID;
  const {watchID} = IsMusicReviewSchema.parse(req.body);

  await ReviewService.removeIsMusicReview(watchID, userID);
  return res.status(200).json({message: "Review removed successfully"});
}

const NERReviewSchema = z.object({
  watchID: z.string().min(1),
  language: z.string().min(1),
  namedEntities: z.array(
    z.object({
      NER: z.string().min(1),
      text: z.string().min(1),
      start: z.number().nonnegative(),
      end: z.number().nonnegative(),
    }),
  ),
});

const DeleteNERReviewSchema = z.object({
  watchID: z.string().min(1),
});

export async function postNERReviewRequestHandler(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userID = userReq.userID;
  const {watchID, language, namedEntities} = NERReviewSchema.parse(req.body);

  await ReviewService.addNERReview(watchID, userID, language, namedEntities);
  return res.status(200).json({message: "NER Review added successfully"});
}

export async function deleteNERReviewRequestHandler(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userID = userReq.userID;
  const {watchID} = DeleteNERReviewSchema.parse(req.body);

  await ReviewService.removeNERReview(watchID, userID);
  return res.status(200).json({message: "NER Review removed successfully"});
}

const GenreReviewSchema = z.object({
  watchID: z.string().min(1),
  genres: z.array(z.string().min(1)),
});

const DeleteGenreReviewSchema = z.object({
  watchID: z.string().min(1),
});

export async function postGenreReviewRequestHandler(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userID = userReq.userID;

  const {watchID, genres} = GenreReviewSchema.parse(req.body);

  await ReviewService.addGenreReview(watchID, userID, genres);
  return res.status(200).json({message: "Genre Review added successfully"});
}

export async function deleteGenreReviewRequestHandler(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userID = userReq.userID;
  const {watchID} = DeleteGenreReviewSchema.parse(req.body);

  await ReviewService.removeGenreReview(watchID, userID);
  return res.status(200).json({message: "Genre Review removed successfully"});
}

export async function getAdminActivityLogsController(req: Request, res: Response) {
  const activityLogs = await ReviewService.getAdminActivityLogs();
  return res.status(200).json({status: "ok", data: activityLogs});
}
