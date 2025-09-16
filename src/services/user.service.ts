import { UserQueries } from "../database/queries/user.queries";
import { InvalidUserError } from "../interface/errors";

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
        const user = await UserQueries.fetchBy(userHandle, 'handle');
        if (!user) throw new InvalidUserError("User not found");
        return UserQueries.getWeeklyTopMusic(user.id, startDate, endDate);
    }

    static async getTopArtists(userHandle: string, startDate?: Date, endDate?: Date) {
        const user = await UserQueries.fetchBy(userHandle, 'handle');
        if (!user) throw new InvalidUserError("User not found");
        return UserQueries.getWeeklyTopArtists(user.id, startDate, endDate);
    }

    static async getTopGenres(userHandle: string, startDate?: Date, endDate?: Date) {
        const user = await UserQueries.fetchBy(userHandle, 'handle');
        if (!user) throw new InvalidUserError("User not found");
        return UserQueries.getWeeklyTopGenres(user.id, startDate, endDate);
    }
}