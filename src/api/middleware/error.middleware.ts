import type {NextFunction, Request, Response} from "express";
import {z} from "zod";
import {ClientError, ExpectedError} from "../../interface/errors";
import {logger} from "../../utils/logger";

export function processErrorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ClientError) {
    logger.info("Client error:", err.message);
    res.status(err.httpCode).json({message: err.message});
    return;
  }
  if (err instanceof ExpectedError) {
    logger.warn("Expected server error:", err.message);
    res.status(500).json({message: "Internal Server Error"});
    return;
  }
  if (err instanceof z.ZodError) {
    logger.info("Validation error:", err.issues);
    res.status(400).json({message: "Invalid request data", details: err.issues});
    return;
  }
  logger.error("Unexpected error:", {error: err});
  console.error(err);
  res.status(500).json({message: "Internal Server Error"});
}
