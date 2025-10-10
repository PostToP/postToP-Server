import {auth} from "../auth";
import {UserQueries} from "../database/queries/user.queries";

export class AuthService {
  static async getUserIDFromSession(session: string) {
    const sessionResponse = await auth.api.getSession({
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!sessionResponse)
      return {
        ok: false,
        data: null,
      };
    const userID = UserQueries.betterAuthIdToUserId(sessionResponse.user?.id as string);
    return {
      ok: true,
      data: {
        userId: await userID,
      },
    };
  }
}
