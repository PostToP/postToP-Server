import { InvalidArgumentError } from "../../interface/errors";
import { Request, Response, NextFunction } from "express";

export function processErrorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof InvalidArgumentError) {
        res.status(400).json({ message: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
}