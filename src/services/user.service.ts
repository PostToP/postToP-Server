import { UserQueries } from "../database/queries/user.queries";
import { InvalidUserError } from "../interface/errors";

export class UserService {
  static async getUserHistory(userHandle: string, filters: Partial<{ limit: number; offset: number }>) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    return UserQueries.getUserHistory(user.id, filters);
  }

  static async getTopMusic(userHandle: string, startDate?: Date, endDate?: Date) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    const rows = await UserQueries.getTopMusic(user.id, startDate, endDate);
    return rows.map(row => ({
      yt_id: row.video_id,
      video_title: row.video_title,
      listen_count: row.listen_count,
      channel: {
        yt_id: row.artist_id,
        name: row.artist_name,
        profile_picture_url: row.artist_profile_picture_url,
      },
    }));
  }

  static async getTopArtists(userHandle: string, startDate?: Date, endDate?: Date) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    return UserQueries.getTopArtists(user.id, startDate, endDate);
  }

  static async getTopGenres(userHandle: string, startDate?: Date, endDate?: Date) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    return UserQueries.getTopGenres(user.id, startDate, endDate);
  }
}
