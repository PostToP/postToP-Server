import { json, urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../../utils/swagger";
import { authRequestHandler, registerRequestHandler } from "../controllers/auth.controller";
import { postGenreReviewRequestHandler, postIsMusicReviewRequestHandler, postNERReviewRequestHandler } from "../controllers/review.controller";
import { getUserController } from "../controllers/user.controller";
import { getVideosController } from "../controllers/video.controller";
import { getYoutubeArtistChannelController } from "../controllers/youtube.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { processErrorMiddleware } from "../middleware/error.middleware";
import { logRequestMiddleware } from "../middleware/logger.middleware";

export function setupAPIRoutes() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(
    urlencoded({
      extended: true,
    }),
  );
  app.use(json());
  app.use(logRequestMiddleware);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.post("/auth", authRequestHandler);
  app.post("/register", registerRequestHandler);
  app.post("/review/music", authMiddleware, postIsMusicReviewRequestHandler);
  app.post("/review/ner", authMiddleware, postNERReviewRequestHandler);
  app.post("/review/genre", authMiddleware, postGenreReviewRequestHandler);
  app.get("/user/:handle", getUserController);
  app.get("/videos", getVideosController);
  app.get("/youtube/artist-channel", authMiddleware, getYoutubeArtistChannelController);

  app.use(processErrorMiddleware);
  return app;
}
