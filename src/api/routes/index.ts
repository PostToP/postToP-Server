import express from "express";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import { processErrorMiddleware } from "../middleware/error.middleware";
import { logRequestMiddleware } from "../middleware/logger.middleware";
import { authRequestHandler } from "../controllers/auth.controller";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "../../utils/swagger";
import "express-async-errors";
import { authMiddleware } from "../middleware/auth.middelware";
import { postIsMusicReviewRequestHandler, postNERReviewRequestHandler } from "../controllers/review.controller";
import { getVideosController } from "../controllers/video.controller";

export function setupAPIRoutes() {
    const app = express();

    app.use(
        urlencoded({
            extended: true,
        })
    );
    app.use(json());
    app.use(cors());
    app.use(logRequestMiddleware);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.post("/auth", authRequestHandler)
    app.post("/review/music", authMiddleware, postIsMusicReviewRequestHandler)
    app.post("/review/ner", authMiddleware, postNERReviewRequestHandler)
    app.get("/videos", getVideosController);

    app.use(processErrorMiddleware);
    return app;
}