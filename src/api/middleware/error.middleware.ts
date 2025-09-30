import type { NextFunction, Request, Response } from "express";
import { ClientError, ExpectedError } from "../../interface/errors";
import { logger } from "../../utils/logger";

export function processErrorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ClientError) {
    logger.info("Client error:", err.message);
    res.status(err.httpCode).json({ message: err.message });
    return;
  }
  if (err instanceof ExpectedError) {
    logger.warn("Expected server error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
  logger.error("Unexpected error:", { error: err });
  res.status(500).json({ message: "Internal Server Error" });
}
