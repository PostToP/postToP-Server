import {VideoQueries} from "../database/queries/video.queries";

export class ReviewService {
  static async addIsMusicReview(videoID: string, userID: number, is_music: boolean) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    const review = await VideoQueries.insertIsMusic(db_id.id, userID, is_music);
    return review;
  }

  static async addNERReview(
    videoID: string,
    userID: number,
    language: string,
    namedEntities: {NER: string; text: string; start: number; end: number}[],
  ) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    const review = await VideoQueries.insertNERReview(db_id.id, userID, language, namedEntities);
    return review;
  }
}
