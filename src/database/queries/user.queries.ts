import { DatabaseManager } from "..";

export async function fetchUserFromUsername(username: string) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("posttop.user")
        .selectAll()
        .where("username", "=", username)
        .executeTakeFirst();
}

export async function fetchUserFromHandle(handle: string) {
    const db = DatabaseManager.getInstance();
    return db.selectFrom("posttop.user")
        .selectAll()
        .where("handle", "=", handle)
        .executeTakeFirst();
}