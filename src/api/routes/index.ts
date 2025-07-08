import express from "express";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import { getDebugRequestHandler } from "../controllers/debug.controller";
import { getArtistRequestHandler } from "../controllers/artist.controller";
import { filterMusicRequestHandler, getMusicRequestHandler } from "../controllers/music.controller";
import { getGenresRequestHandler } from "../controllers/genre.controller";
import { processErrorMiddleware } from "../middleware/error.middleware";

export function setupRoutes() {
    const app = express();

    app.use(
        urlencoded({
            extended: true,
        })
    );
    app.use(json());
    app.use(cors());
    app.get("/debug", getDebugRequestHandler)
    app.get("/artist", getArtistRequestHandler);
    app.get("/music", getMusicRequestHandler);
    app.get("/genre", getGenresRequestHandler);
    app.post("/filter", filterMusicRequestHandler);

    app.use(processErrorMiddleware);
    return app;
}