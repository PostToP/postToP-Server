import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { InvalidUserError } from "../interface/errors";
import { UserQueries } from "../database/queries/user.queries";
const jwtToken = process.env.JWT_TOKEN ?? "";

export async function authenticateUser(username: string, password: string) {
    if (!(await isValidUser(username, password))) {
        throw new InvalidUserError("Invalid username or password");
    }
    const user = await UserQueries.fetchByUsername(username);
    const token = jwt.sign({ userId: user?.id }, jwtToken, { expiresIn: '90d' });
    return token;
}

export async function isValidUser(username: string, password: string) {
    const user = await UserQueries.fetchHash(username);
    if (!user) {
        return false;
    }

    return bcrypt.compareSync(password, user.password_hash);
}

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, jwtToken);
        return {
            ok: true,
            data: decoded as DecodedToken
        }
    } catch (error) {
        return {
            ok: false,
            data: null
        }
    }
}

interface DecodedToken {
    userId: number;
}