import { Request, Response } from "express";
import { addUserReview } from "../../services/music.service";

export async function postReviewRequestHandler(req: Request, res: Response) {
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