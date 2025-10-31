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

export async function postNERReviewRequestHandler(req: Request, res: Response) {
  const userReq = req as AuthenticatedRequest;
  const userID = userReq.userID;

  const {watchID, language, namedEntities} = NERReviewSchema.parse(req.body);

  await ReviewService.addNERReview(watchID, userID, language, namedEntities);
  return res.status(200).json({message: "NER Review added successfully"});
}
