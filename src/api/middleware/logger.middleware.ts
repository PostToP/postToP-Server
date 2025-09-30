import type { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";

export function logRequestMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      referer: req.get("Referer"),
      responseSize: res.get("Content-Length") || 0,
      statusCode: res.statusCode,
      responseTime: duration,
    });
  });
  next();
}
