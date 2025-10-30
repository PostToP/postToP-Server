import {UserQueries} from "../database/queries/user.queries";
import {VideoQueries} from "../database/queries/video.queries";
import {ModelType} from "../model/db";
import type {VideoID} from "../model/override";

const AI_MODEL_URL = process.env.AI_MODEL_URL;

export class IsMusicAiService {
  private static async fetch(videoID: VideoID) {
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
    result.version = result.version.startsWith("v") ? result.version.slice(1) : result.version;
    return result as {
      prediction: number;
      version: string;
    };
  }

  static async getOrFetch(videoID: VideoID) {
    const is_music_ai = await VideoQueries.fetchIsMusicByAI(videoID);
    if (is_music_ai) {
      return is_music_ai.is_music;
    }
    const currentResponse = await IsMusicAiService.fetch(videoID);
    const is_music = currentResponse.prediction >= 0.5;
    const aiUserID = await UserQueries.fetchAI(ModelType.IS_MUSIC_CLASSIFIER, currentResponse.version);
    if (!aiUserID) {
      throw new Error("AI user not found");
    }
    await VideoQueries.insertIsMusicByAI(videoID, aiUserID?.id, is_music);
    return is_music;
  }
}
