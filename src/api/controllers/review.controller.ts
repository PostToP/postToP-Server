import type { Request, Response } from "express";
import { ReviewService } from "../../services/review.service";

export async function postIsMusicReviewRequestHandler(req: Request, res: Response) {
  const userID = req.userID;

  if (!userID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const watchID = req.body.watchID;
  const is_music = req.body.is_music;

  if (!watchID || typeof watchID !== "string") {
    return res.status(400).json({ error: "Invalid video ID" });
  }

  if (typeof is_music !== "boolean") {
    return res.status(400).json({ error: "is_music must be a boolean" });
  }

  try {
    await ReviewService.addIsMusicReview(watchID, userID, is_music);
    return res.status(200).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function postNERReviewRequestHandler(req: Request, res: Response) {
  const userID = req.userID;
  if (!userID) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const watchID = req.body.watchID;
  const language = req.body.language;
  const namedEntities = req.body.namedEntities;

  if (!watchID || typeof watchID !== "string") {
    return res.status(400).json({ error: "Invalid video ID" });
  }

  if (!Array.isArray(namedEntities)) {
    return res.status(400).json({ error: "namedEntities must be an array" });
  }

  try {
    await ReviewService.addNERReview(watchID, userID, language, namedEntities);
    return res.status(200).json({ message: "NER Review added successfully" });
  } catch (error) {
    console.error("Error adding NER review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
