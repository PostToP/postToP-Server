import type {Request, Response} from "express";
import {YouTubeService} from "../../services/youtube.service";

export async function getYoutubeArtistChannelController(req: Request, res: Response) {
  const channelId = req.query.channelId as string;

  if (!channelId) {
    return res.status(400).json({error: "channelId query parameter is required"});
  }

  try {
    const channelDetails = await YouTubeService.fetchArtistChannelDetails(channelId);
    return res.status(200).json(channelDetails);
  } catch (error) {
    console.error("Error fetching YouTube artist channel details:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}
