import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {UserQueries} from "../database/queries/user.queries";
import {InvalidUserError} from "../interface/errors";

const jwtToken = process.env.JWT_TOKEN ?? "";

export class AuthService {
  static async auth(username: string, password: string) {
    if (!(await AuthService.isValid(username, password))) {
      throw new InvalidUserError("Invalid username or password");
    }
    const user = await UserQueries.fetchBy(username, "username");
    const token = jwt.sign({userId: user?.id}, jwtToken, {expiresIn: "90d"});
    return token;
  }

  private static async isValid(username: string, password: string) {
    const user = await UserQueries.fetchHash(username);
    if (!user) {
      return false;
    }

    return bcrypt.compareSync(password, user.password_hash);
  }

  static verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, jwtToken);
      return {
        ok: true,
        data: decoded as DecodedToken,
      };
    } catch (_error) {
      return {
        ok: false,
        data: null,
      };
    }
  }
}

interface DecodedToken {
  userId: number;
}
