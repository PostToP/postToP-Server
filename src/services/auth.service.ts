import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserQueries } from "../database/queries/user.queries";
import { InvalidUserError, UsernameTakenError } from "../interface/errors";

const jwtToken = process.env.JWT_TOKEN ?? "";

export class AuthService {
  static async auth(username: string, password: string) {
    if (!(await AuthService.isValid(username, password))) {
      throw new InvalidUserError("Invalid username or password");
    }
    const user = await UserQueries.fetchBy(username, "username");
    const token = jwt.sign({ userId: user?.id }, jwtToken, { expiresIn: "90d" });
    return {
      token: token,
      user: {
        id: user?.id,
        username: user?.username,
      },
    }
  }

  private static async isValid(username: string, password: string) {
    const user = await UserQueries.fetchHash(username);
    if (!user) {
      return false;
    }

    return bcrypt.compareSync(password, user.password_hash);
  }

  static verifyToken(token: string): VerifyTokenResult {
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

  static async register(username: string, email: string, password: string) {
    const existingUser = await UserQueries.fetchBy(username, "username");
    if (existingUser) {
      throw new UsernameTakenError("Username already exists");
    }
    const existingEmail = await UserQueries.fetchBy(email, "mail");
    if (existingEmail) {
      throw new UsernameTakenError("Email already exists");
    }

    const password_hash = bcrypt.hashSync(password, 10);

    await UserQueries.insert(username, email, password_hash);
  }
}

type ok = {
  ok: true;
  data: DecodedToken;
};

type notOk = {
  ok: false;
  data: null;
};

export type VerifyTokenResult = ok | notOk;

interface DecodedToken {
  userId: number;
}
