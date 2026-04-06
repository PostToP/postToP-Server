import {VideoQueries} from "../database/queries/video.queries";

export class ReviewService {
  static async addIsMusicReview(videoID: string, userID: number, is_music: boolean) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    const review = await VideoQueries.insertIsMusicByUser(db_id.id, userID, is_music);
    return review;
  }

  static async removeIsMusicReview(videoID: string, userID: number) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    await VideoQueries.removeIsMusicByUser(db_id.id, userID);
  }

  static async getIsMusicReview(videoID: string, userID: number) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    const review = await VideoQueries.fetchIsMusicByUser(db_id.id, userID);
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

  static async addGenreReview(videoID: string, userID: number, genres: string[]) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    const review = await VideoQueries.insertGenreReview(db_id.id, userID, genres);
    return review;
  }

  static async removeNERReview(videoID: string, userID: number) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    await VideoQueries.removeNERReview(db_id.id, userID);
  }

  static async removeGenreReview(videoID: string, userID: number) {
    const db_id = await VideoQueries.fetch(videoID);
    if (!db_id) {
      throw new Error("Video not found");
    }
    await VideoQueries.removeGenreReview(db_id.id, userID);
  }

  static async getAdminActivityLogs() {
    const activityLogs = await VideoQueries.fetchAdminActivityLogs();
    return activityLogs;
  }
}
