import type { YouTubeApiResponse } from "../interface/youtube";

const YT_API_BASE_URL = "https://youtube.googleapis.com/youtube/v3";

export class YouTubeService {
  static async fetchVideoDetails(videoId: string): Promise<YouTubeApiResponse> {
    const baseUrl = `${YT_API_BASE_URL}/videos`;
    const params = new URLSearchParams({
      part: "snippet,topicDetails,localizations,contentDetails",
      id: videoId,
      key: process.env.YT_API_KEY || "TODO",
    });
    const url = `${baseUrl}?${params.toString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = (await response.json()) as YouTubeApiResponse;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch YouTube video details: ${error}`);
    }
  }

  static convertDetails(details: YouTubeApiResponse) {
    if (!details.items || details.items.length === 0) {
      throw new Error("No video details found");
    }
    const item = details.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      duration: YouTubeService.convertDuration(item.contentDetails.duration),
      categoryId: Number(item.snippet.categoryId),
      topicCategories: item.topicDetails?.topicCategories || [],
      defaultLanguage: item.snippet.defaultLanguage,
      defaultAudioLanguage: item.snippet.defaultAudioLanguage,
      localizations: item.localizations || {},
    };
  }

  private static convertDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) {
      return 0; // probably live stream TODO
    }
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
}
