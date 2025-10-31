import type {Request, Response} from "express";
import z from "zod";
import {YouTubeService} from "../../services/youtube.service";

const GetYoutubeArtistChannelQuerySchema = z.object({
  channelId: z.string().min(1),
});

export async function getYoutubeArtistChannelController(req: Request, res: Response) {
  const {channelId} = GetYoutubeArtistChannelQuerySchema.parse(req.query);

  const channelDetails = await YouTubeService.fetchArtistChannelDetails(channelId);
  return res.status(200).json(channelDetails);
}
