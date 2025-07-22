import { DatabaseManager } from "..";

export async function fetchUserHash(username: string) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("posttop.user")
        .select(["password_hash"])
        .where("username", "=", username)
        .executeTakeFirst();
}