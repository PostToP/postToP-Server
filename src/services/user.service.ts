import {UserQueries} from "../database/queries/user.queries";
import {InvalidUserError} from "../interface/errors";
import { AuthService } from "./auth.service";

export class UserService {
  static async getUserInfo(userHandle: string) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    return {
      username: user.username,
      handle: user.handle,
      created_at: user.created_at,
    };
  }

  static async getUserHistory(userHandle: string, filters: Partial<{limit: number; offset: number}>) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    return UserQueries.getUserHistory(user.id, filters);
  }

  static async getTopMusic(userHandle: string, startDate?: Date, endDate?: Date, limit?: number, offset?: number) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    const rows = await UserQueries.getTopMusic(user.id, startDate, endDate, limit, offset);
    return rows.map(row => ({
      yt_id: row.video_id,
      video_title: row.video_title,
      listen_count: row.listen_count,
      channel: {
        yt_id: row.artist_id,
        name: row.artist_name,
        profile_picture_url: row.artist_profile_picture_url,
      },
      NER: row.NER,
    }));
  }

  static async getTopArtists(userHandle: string, startDate?: Date, endDate?: Date, limit?: number, offset?: number) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    return UserQueries.getTopArtists(user.id, startDate, endDate, limit, offset);
  }

  static async getTopGenres(userHandle: string, startDate?: Date, endDate?: Date, limit?: number, offset?: number) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    return UserQueries.getTopGenres(user.id, startDate, endDate, limit, offset);
  }

  static async getUserStats(userHandle: string, filters: Partial<{startDate: Date; endDate: Date}>) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    if (!user) throw new InvalidUserError("User not found");
    const data = Promise.all([
      UserQueries.getUserTotalSeconds(user.id),
      UserQueries.getUserTotalSeconds(user.id, filters),
      UserQueries.getUserListenSegments(user.id, filters),
    ]).then(([totalListens, totalListensFilter, listenSegments]) => ({
      total_listens: totalListens,
      total_listens_filtered: totalListensFilter,
      listen_segments: listenSegments,
    }));
    return data;
  }

  static async updateUserInfo(userHandle: string, updates: Partial<{email: string; displayName: string; handle: string; currentPassword: string; newPassword: string}>) {
    const user = await UserQueries.fetchBy(userHandle, "handle");
    
    if (!user) throw new InvalidUserError("User not found");
    
    if (updates.handle && updates.handle !== user.handle) {
      const existingHandle = await UserQueries.fetchBy(updates.handle, "handle");
      if (existingHandle) throw new InvalidUserError("Handle already exists");
    }
    
    if (updates.email && updates.email !== user.mail) {
      const existingEmail = await UserQueries.fetchBy(updates.email, "mail");
      if (existingEmail) throw new InvalidUserError("Email already exists");
    }
    
    if (updates.newPassword) {
      if (!updates.currentPassword) {
        throw new InvalidUserError("Current password is required to set a new password");
      }
      const isValid = await AuthService.isValid(user?.username, updates.currentPassword);
      if (!isValid) {
        throw new InvalidUserError("Current password is incorrect");
      }
    }

    await UserQueries.updateUserInfo(user.id, updates);
  }
}
