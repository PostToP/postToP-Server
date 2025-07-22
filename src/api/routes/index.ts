import express from "express";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import { getDebugRequestHandler } from "../controllers/debug.controller";
import { getArtistRequestHandler } from "../controllers/artist.controller";
import { filterMusicRequestHandler, getMusicRequestHandler } from "../controllers/music.controller";
import { getGenresRequestHandler } from "../controllers/genre.controller";
import { processErrorMiddleware } from "../middleware/error.middleware";
import { logRequestMiddleware } from "../middleware/logger.middleware";
import { authRequestHandler } from "../controllers/auth.controller";

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

    app.get("/debug", getDebugRequestHandler)
    app.get("/artist", getArtistRequestHandler);
    app.get("/music", getMusicRequestHandler);
    app.get("/genre", getGenresRequestHandler);
    app.get("/auth", authRequestHandler)
    app.post("/filter", filterMusicRequestHandler);

    app.use(processErrorMiddleware);
    return app;
}