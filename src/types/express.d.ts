// biome-ignore lint/correctness/noUnusedImports: <explanation> Importing to extend express Request type </explanation>
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userID?: number;
    }
  }
}
