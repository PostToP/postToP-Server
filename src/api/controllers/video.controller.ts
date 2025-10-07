import type {Request, Response} from "express";
import {VideoService} from "../../services/video.service";

export async function getVideosController(req: Request, res: Response) {
  const query = req.query;

  const limit = parseInt(query.limit as string, 10) || 10;
  const page = parseInt(query.page as string, 10) || 0;
  const sortBy = (query.sortBy as string) || "alphabetical";
  const reverse = query.reverse === "true";
  let verified = query.verified as any | undefined;
  let music = query.music as any | undefined;
  if (music !== undefined) {
    music = (music as string) === "true";
  }
  if (verified !== undefined) {
    verified = verified === "true";
  }
  let hasNER = query.hasNER as any | undefined;
  if (hasNER !== undefined) {
    hasNER = (hasNER as string) === "true";
  }

  // TODO validate query parameters

  try {
    const reviews = await VideoService.getAll({limit, page, sortBy, reverse, filters: {verified, music, hasNER}});
    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}
