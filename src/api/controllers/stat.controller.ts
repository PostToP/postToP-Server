import type { Request, Response } from "express";
import { StatsService } from "../../services/stats.service";


export async function getServerStatsController(req: Request, res: Response) {

    const serverStat = await StatsService.getServerStats();

    return res.status(200).json({ status: "ok", data: serverStat });
}
