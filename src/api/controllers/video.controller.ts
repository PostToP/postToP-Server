import type {Request, Response} from "express";
import {z} from "zod";
import {VideoService} from "../../services/video.service";

export const GetVideosQuerySchema = z.object({
  limit: z.coerce.number().optional().default(10),
  page: z.coerce.number().optional().default(0),
  sortBy: z.enum(["alphabetical", "date_added", "popularity"]).optional().default("alphabetical"),
  reverse: z.coerce.boolean().optional().default(false),
  verified: z.coerce.boolean().optional().default(false),
  music: z.coerce.boolean().optional().default(false),
  hasNER: z.coerce.boolean().optional().default(false),
});

export async function getVideosController(req: Request, res: Response) {
  const {limit, page, sortBy, reverse, verified, music, hasNER} = GetVideosQuerySchema.parse(req.query);

  try {
    const reviews = await VideoService.getAll({limit, page, sortBy, reverse, filters: {verified, music, hasNER}});
    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}
