import { Request, Response } from "express";
import { fetchAll } from "../../database/queries/misc.queries";

export async function getDebugRequestHandler(_req: Request, res: Response) {
    try {
        const data = await fetchAll();
        res.status(200).json(data);
    } catch (error) {
        console.error("Debug endpoint error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}