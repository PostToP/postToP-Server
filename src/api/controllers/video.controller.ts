import type {Request, Response} from "express";
import {z} from "zod";
import {VideoService} from "../../services/video.service";

export const OptionalBoolean = z
  .string()
  .toLowerCase()
  .refine(v => v === "true" || v === "false", {
    message: "Expected true or false",
  })
  .transform(v => v === "true")
  .nullable()
  .optional()
  .transform(v => (typeof v === "boolean" ? v : undefined));

export const GetVideosQuerySchema = z.object({
  limit: z.coerce.number().optional().default(10),
  page: z.coerce.number().optional().default(0),
  sortBy: z.enum(["alphabetical", "duration", "date", "random"]).optional().default("alphabetical"),
  reverse: z.coerce.boolean().optional().default(false),
  verified: OptionalBoolean,
  music: OptionalBoolean,
  hasNER: OptionalBoolean,
});

export async function getVideosController(req: Request, res: Response) {
  const {limit, page, sortBy, reverse, verified, music, hasNER} = GetVideosQuerySchema.parse(req.query);
  console.log("Fetching videos with params:", {limit, page, sortBy, reverse, verified, music, hasNER});
  const reviews = await VideoService.getAll({limit, page, sortBy, reverse, filters: {verified, music, hasNER}});
  return res.status(200).json(reviews);
}
