import {UserQueries} from "../database/queries/user.queries";

export class GoogleService {
  static async getAccessToken(userID: number): Promise<string> {
    const userTokens = await UserQueries.getUsersYTTokens(userID);
    if (!userTokens) throw new Error("No tokens found for user");

    if (new Date() < userTokens.accessTokenExpiresAt!) {
      return userTokens.accessToken!;
    }

    const params = new URLSearchParams();
    params.append("client_id", process.env.GOOGLE_CLIENT_ID!);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET!);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", userTokens.refreshToken!);

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${response.statusText}`);
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in;
    const newExpiryDate = new Date(Date.now() + expiresIn * 1000);

    UserQueries.updateUserAccessToken(userID, newAccessToken, newExpiryDate);

    return newAccessToken;
  }
}
