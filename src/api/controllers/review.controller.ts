import { Request, Response } from "express";
import { addNERReview, addUserReview } from "../../services/music.service";

export async function postIsMusicReviewRequestHandler(req: Request, res: Response) {
    const userID = req.userID!;

    const watchID = req.body.watchID;
    const is_music = req.body.is_music;

    if (!watchID || typeof watchID !== "string") {
        return res.status(400).json({ error: "Invalid video ID" });
    }

    if (typeof is_music !== "boolean") {
        return res.status(400).json({ error: "is_music must be a boolean" });
    }

    try {
        await addUserReview(watchID, userID, is_music);
        return res.status(200).json({ message: "Review added successfully" });
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function postNERReviewRequestHandler(req: Request, res: Response) {
    const userID = req.userID!;

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
        await addNERReview(watchID, userID, language, namedEntities);
        return res.status(200).json({ message: "NER Review added successfully" });
    } catch (error) {
        console.error("Error adding NER review:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}