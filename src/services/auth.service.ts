import {fromNodeHeaders} from "better-auth/node";
import type {IncomingHttpHeaders} from "http";
import {auth} from "../auth";
import {UserQueries} from "../database/queries/user.queries";

export class AuthService {
  static async getUserIDFromSessionID(session: string) {
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

  static async getUserIDFromHeaders(headers: IncomingHttpHeaders) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });
    if (!session)
      return {
        ok: false,
        data: null,
      };
    const userID = UserQueries.betterAuthIdToUserId(session.user?.id as string);
    return {
      ok: true,
      data: {
        userId: await userID,
      },
    };
  }
}
