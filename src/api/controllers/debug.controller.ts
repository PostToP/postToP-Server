import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { MiscQueries } from "../../database/queries/misc.queries";

export async function getDebugRequestHandler(_req: Request, res: Response) {
    try {
        const data = await MiscQueries.fetchAll();
        res.status(200).json(data);
    } catch (error) {
        logger.error("Debug endpoint error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}