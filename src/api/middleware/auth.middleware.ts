import type {NextFunction, Request, Response} from "express";
import {UnathorizedError} from "../../interface/errors";
import {AuthService} from "../../services/auth.service";
import type {AuthenticatedRequest} from "../../types/express";

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnathorizedError("Authorization token is missing");
  }
  const decoded = AuthService.verifyToken(token);
  if (!decoded.ok) {
    throw new UnathorizedError("Invalid or expired token");
  }

  (req as AuthenticatedRequest).userID = decoded.data.userId;
  next();
}
