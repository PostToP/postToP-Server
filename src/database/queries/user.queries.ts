import { DatabaseManager } from "..";

export class UserQueries {
    static async fetchByUsername(username: string) {
        const db = DatabaseManager.getInstance();
        return db.selectFrom("posttop.user")
            .selectAll()
            .where("username", "=", username)
            .executeTakeFirst();
    }

    static async fetchByHandle(handle: string) {
        const db = DatabaseManager.getInstance();
        return db.selectFrom("posttop.user")
            .selectAll()
            .where("handle", "=", handle)
            .executeTakeFirst();
    }

    static async fetchHash(username: string) {
        const db = DatabaseManager.getInstance();
        return db.selectFrom("posttop.user")
            .select(["password_hash"])
            .where("username", "=", username)
            .executeTakeFirst();
    }
}