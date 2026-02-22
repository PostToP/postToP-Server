import {UserQueries} from "../database/queries/user.queries";
import {VideoQueries} from "../database/queries/video.queries";
import {ModelType} from "../model/db";
import type {VideoID} from "../model/override";
import {fetchJsonWithRetry} from "../utils/fetch";
import {logger} from "../utils/logger";

const AI_MODEL_URL = process.env.AI_MODEL_URL!;
const AI_MODEL_URL_NER = process.env.AI_MODEL_URL_NER!;

export class IsMusicAiService {
  private static async fetch(videoID: VideoID) {
    const data = await VideoQueries.fetchAiData(videoID);
    const body = {
      title: data?.title,
      description: data?.description,
      categories: data?.categories || [],
      duration: data?.duration,
    };

    const res = await fetchJsonWithRetry<{prediction: number; version: string}>(AI_MODEL_URL, {method: "POST", body});
    if (!res.ok) {
      throw new Error(`Failed to fetch AI prediction: ${res.error}`);
    }
    const result = res.data;

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

export class NERAIService {
  private static async fetch(videoID: VideoID) {
    const data = await VideoQueries.fetchAiData(videoID);
    const body = {
      title: data?.title,
      description: data?.description,
    };
    const res = await fetchJsonWithRetry<{entities: string[][]; result: Record<string, string[]>}>(AI_MODEL_URL_NER, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch NER AI prediction: ${res.error}`);
    }
    const result = res.data;

    // TODO: remove this once the model is updated to return uppercase keys
    const uppercaseResult = {
      entities: result.entities,
      result: Object.keys(result.result || {}).reduce((acc: any, key: string) => {
        acc[key.toUpperCase()] = result.result[key];
        return acc;
      }, {}),
    };

    if (uppercaseResult.result.ORIGINAL_AUTHORS) {
      uppercaseResult.result.ORIGINAL_AUTHOR = uppercaseResult.result.ORIGINAL_AUTHORS;
      delete uppercaseResult.result.ORIGINAL_AUTHORS;
    }

    if (uppercaseResult.result.PERFORMER) {
      uppercaseResult.result.VOCALIST = uppercaseResult.result.PERFORMER;
      delete uppercaseResult.result.PERFORMER;
    }

    return uppercaseResult as {
      entities: string[][];
      result: {
        ORIGINAL_AUTHOR: string[];
        TITLE: string[];
        FEATURING: string[];
        MODIFIER: string[];
        VOCALOID: string[];
        MISC_PERSON: string[];
        VOCALIST: string[];
        ALT_TITLE: string[];
        ALBUM: string[];
      };
    };
  }

  static async getOrFetch(videoID: VideoID) {
    const ner_ai = await VideoQueries.fetchNERByAI(videoID);
    if (ner_ai) {
      logger.info(`NER AI data for video ${videoID} fetched from database`);
      return ner_ai;
    }
    logger.info(`NER AI data for video ${videoID} not found in database, fetching from AI model`);
    const currentResponse = await NERAIService.fetch(videoID);
    const aiUserID = await UserQueries.fetchAI(ModelType.NER, "v1");
    if (!aiUserID) {
      throw new Error("AI user not found");
    }
    await VideoQueries.insertNERByAI(videoID, aiUserID?.id, currentResponse.result);
    return currentResponse.result;
  }
}
