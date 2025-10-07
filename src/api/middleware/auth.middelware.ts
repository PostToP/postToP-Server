import type {Request, Response} from "express";
import {UnathorizedError} from "../../interface/errors";
import {AuthService} from "../../services/auth.service";

// biome-ignore lint/complexity/noBannedTypes: <explanation> Using Function type for next to match express types </explanation>
export function authMiddleware(req: Request, _res: Response, next: Function) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnathorizedError("Authorization token is missing");
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded.ok) {
    throw new UnathorizedError("Invalid or expired token");
  }

  req.userID = decoded.data?.userId;
  next();
}
