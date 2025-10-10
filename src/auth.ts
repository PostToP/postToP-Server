import {betterAuth} from "better-auth";
import {bearer} from "better-auth/plugins";
import {Pool} from "pg";
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
      advanced: {
        database: {
          useNumberId: true,
        },
      },
    },
  },
  user: {
    modelName: "user_better_auth",
  },
  trustedOrigins: ["http://localhost:3000", "chrome-extension://*", "*"],
  plugins: [bearer()],
});
