import type {NextFunction, Request, Response} from "express";
import {UserQueries} from "../../database/queries/user.queries";
import {UnathorizedError} from "../../interface/errors";
import type {AuthenticatedRequest} from "../../types/express";

export async function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
  const userId = (req as AuthenticatedRequest).userID;
  if (!userId) {
    throw new UnathorizedError("User ID is missing in the request");
  }
  const userRole = await UserQueries.getUserRole(userId);
  if (!userRole) {
    throw new UnathorizedError("User not found");
  }
  if (userRole.trim().toLowerCase() !== "admin") {
    throw new UnathorizedError("User does not have admin privileges");
  }
  next();
}
