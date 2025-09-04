import { UnathorizedError } from "../../interface/errors";
import { AuthService } from "../../services/auth.service";
import { Request, Response } from "express";

export function authMiddleware(req: Request, res: Response, next: Function) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw new UnathorizedError("Authorization token is missing");
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded.ok) {
        throw new UnathorizedError("Invalid or expired token");
    }

    req.userID = decoded.data!.userId;
    next();
}