import type {Request, Response} from "express";
import {UnathorizedError} from "../../interface/errors";
import {AuthService} from "../../services/auth.service";

// biome-ignore lint/complexity/noBannedTypes: <explanation> Using Function type for next to match express types </explanation>
export async function authMiddleware(req: Request, _res: Response, next: Function) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnathorizedError("Authorization token is missing");
  }

  const sessionResponse = await AuthService.getUserIDFromSession(token);
  if (!sessionResponse.ok) throw new UnathorizedError("Could not validate token");

  req.userID = sessionResponse.data?.userId;
  next();
}
