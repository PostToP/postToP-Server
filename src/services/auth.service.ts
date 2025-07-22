import { fetchUserHash } from "../database/queries/auth.queries";
import bcrypt from "bcrypt";
import { fetchUserFromUsername } from "../database/queries/user.queries";
import jwt from "jsonwebtoken";
const jwtToken = process.env.JWT_TOKEN ?? "";

export async function authenticateUser(username: string, password: string) {
    if (!(await isValidUser(username, password))) {
        throw new Error("Invalid username or password");
    }
    const user = await fetchUserFromUsername(username);
    const token = jwt.sign({ userId: user?.id }, jwtToken, { expiresIn: '90d' });
    return token;
}

export async function isValidUser(username: string, password: string) {
    const user = await fetchUserHash(username);
    if (!user) {
        return false;
    }

    return bcrypt.compareSync(password, user.password_hash);
}