import type {Request, Response} from "express";
import z from "zod";
import {IsMusicAiService, NERAIService} from "../../services/ai.service";
import {VideoService} from "../../services/video.service";

const WatchIDQuerySchema = z.object({
  watchID: z.string().min(1),
});

export async function getIsMusicAiProxyController(req: Request, res: Response) {
  const {watchID} = WatchIDQuerySchema.parse(req.query);

  const videoID = await VideoService.getOrFetch(watchID);
  const prediction = await IsMusicAiService.fetchPrediction(videoID);

  const is_music = prediction.prediction >= 0.5;

  return res.status(200).json({
    is_music,
    prediction: prediction.prediction,
    version: prediction.version,
  });
}

export async function getNERAIProxyController(req: Request, res: Response) {
  const {watchID} = WatchIDQuerySchema.parse(req.query);

  const videoID = await VideoService.getOrFetch(watchID);
  const {prediction, version} = await NERAIService.fetchPrediction(videoID);

  return res.status(200).json({
    prediction,
    version,
  });
}
