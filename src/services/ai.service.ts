import {UserQueries} from "../database/queries/user.queries";
import {VideoQueries} from "../database/queries/video.queries";

const AI_MODEL_URL = process.env.AI_MODEL_URL;

export class IsMusicAiService {
  private static async fetch(videoID: string) {
    const data = await VideoQueries.fetchAiData(videoID);
    const body = {
      title: data?.title,
      description: data?.description,
      categories: data?.categories || [],
      duration: data?.duration,
    };
    if (!AI_MODEL_URL) {
      throw new Error("AI_MODEL_URL is not defined in environment variables");
    }
    const analysis = await fetch(AI_MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await analysis.json();
    return result as {
      prediction: number;
      version: `v${number}.${number}.${number}`;
    };
  }

  static async getOrFetch(videoID: string) {
    const is_music_ai = await VideoQueries.fetchIsMusicByAI(videoID);
    if (is_music_ai) {
      return is_music_ai.is_music;
    }
    const currentResponse = await IsMusicAiService.fetch(videoID);
    const is_music = currentResponse.prediction >= 0.5;
    const aiUserID = await UserQueries.fetchAI(currentResponse.version);
    if (!aiUserID) {
      throw new Error("AI user not found");
    }
    await VideoQueries.insertIsMusic(videoID, aiUserID?.id, is_music);
    return is_music;
  }
}
