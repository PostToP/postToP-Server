import { DatabaseManager } from "..";

export class UserQueries {
    static async fetchBy(identifier: string | number,
        type: 'username' | 'handle' | 'id',
    ) {
        const db = DatabaseManager.getInstance();

        return db.selectFrom("posttop.user")
            .selectAll()
            .where(type, "=", identifier)
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