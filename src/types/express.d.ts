import type {Request} from "express";

interface AuthenticatedRequest extends Request {
  userID: number;
}
