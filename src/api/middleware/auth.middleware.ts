import type {Request, Response} from "express";
import {UnathorizedError} from "../../interface/errors";
import {AuthService} from "../../services/auth.service";

// biome-ignore lint/complexity/noBannedTypes: <explanation> Using Function type for next to match express types </explanation>
export async function authMiddleware(req: Request, res: Response, next: Function) {
  const response = await AuthService.getUserIDFromHeaders(req.headers);
  if (!response.ok || !response.data) {
    throw new UnathorizedError("Invalid or missing authentication token");
  }
  const userID = response.data.userId;
  if (!userID) {
    throw new UnathorizedError("Invalid or missing authentication token");
  }

  req.userID = userID;
  next();
}
