import type {Request, Response} from "express";
import {GoogleService} from "../../services/google.service";
import {YouTubeService} from "../../services/youtube.service";

export async function getYoutubeArtistChannelController(req: Request, res: Response) {
  const userId = req.userID!;
  const channelId = req.query.channelId as string;
  const userAccessToken = await GoogleService.getAccessToken(userId);

  if (!channelId) {
    return res.status(400).json({error: "channelId query parameter is required"});
  }

  try {
    const channelDetails = await YouTubeService.fetchArtistChannelDetails(channelId, userAccessToken);
    return res.status(200).json(channelDetails);
  } catch (error) {
    console.error("Error fetching YouTube artist channel details:", error);
    return res.status(500).json({error: "Internal server error"});
  }
}
