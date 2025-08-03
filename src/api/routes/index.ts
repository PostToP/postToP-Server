import express from "express";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import { getDebugRequestHandler } from "../controllers/debug.controller";
import { getArtistRequestHandler } from "../controllers/artist.controller";
import { getMusicRequestHandler } from "../controllers/music.controller";
import { getGenresRequestHandler } from "../controllers/genre.controller";
import { processErrorMiddleware } from "../middleware/error.middleware";
import { logRequestMiddleware } from "../middleware/logger.middleware";
import { authRequestHandler } from "../controllers/auth.controller";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "../../utils/swagger";
import "express-async-errors";
import { authMiddleware } from "../middleware/auth.middelware";
import { postReviewRequestHandler } from "../controllers/review.controller";

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

    app.get("/debug", getDebugRequestHandler)
    app.get("/artist", getArtistRequestHandler);
    app.get("/music", getMusicRequestHandler);
    app.get("/genre", getGenresRequestHandler);
    app.get("/auth", authRequestHandler)
    app.post("/review/music", authMiddleware, postReviewRequestHandler)

    app.use(processErrorMiddleware);
    return app;
}