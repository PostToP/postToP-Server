import {UserQueries} from "../database/queries/user.queries";
import {InvalidUserError} from "../interface/errors";

export class UserService {
  // static async getWeeklyTopStats(userHandle: string) {
  //     const user = await UserQueries.fetchBy(userHandle, 'handle');
  //     if (!user) throw new InvalidUserError("User not found");
  //     const topMusic = UserQueries.getWeeklyTopMusic(user.id);
  //     const topArtists = UserQueries.getWeeklyTopArtists(user.id);
  //     const topGenres = UserQueries.getWeeklyTopGenres(user.id);
  //     return {
  //         topMusic: await topMusic,
  //         topArtists: await topArtists,
  //         topGenres: await topGenres
  //     };
  // }

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
