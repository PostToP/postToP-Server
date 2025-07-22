import { DatabaseManager } from "..";

export async function fetchUserFromUsername(username: string) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("posttop.user")
        .selectAll()
        .where("username", "=", username)
        .executeTakeFirst();
}