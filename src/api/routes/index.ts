import {json, urlencoded} from "body-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "../../utils/swagger";
import {getIsMusicAiProxyController, getNERAIProxyController} from "../controllers/ai.controller";
import {authRequestHandler, registerRequestHandler} from "../controllers/auth.controller";
import {
  deleteIsMusicReviewRequestHandler,
  postGenreReviewRequestHandler,
  postIsMusicReviewRequestHandler,
  postNERReviewRequestHandler,
} from "../controllers/review.controller";
import {getServerStatsController} from "../controllers/stat.controller";
import {
  getUserHistoryController,
  getUserInfoController,
  getUserStatisticsController,
  getUserStatsController,
} from "../controllers/user.controller";
import {getVideosController} from "../controllers/video.controller";
import {getYoutubeArtistChannelController} from "../controllers/youtube.controller";
import {authMiddleware} from "../middleware/auth.middleware";
import {processErrorMiddleware} from "../middleware/error.middleware";
import {logRequestMiddleware} from "../middleware/logger.middleware";

export function setupAPIRoutes() {
  const app = express();
  app.options("*", cors());
  app.use(cors());
  app.use(
    urlencoded({
      extended: true,
    }),
  );
  app.use(json());
  app.use(logRequestMiddleware);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/ai/is-music", getIsMusicAiProxyController);
  app.get("/ai/ner", getNERAIProxyController);

  app.post("/auth", authRequestHandler);
  app.post("/register", registerRequestHandler);
  app.post("/review/music", authMiddleware, postIsMusicReviewRequestHandler);
  app.delete("/review/music", authMiddleware, deleteIsMusicReviewRequestHandler);
  app.post("/review/ner", authMiddleware, postNERReviewRequestHandler);
  app.post("/review/genre", authMiddleware, postGenreReviewRequestHandler);
  app.get("/user/:handle/top", getUserStatisticsController);
  app.get("/user/:handle", getUserInfoController);
  app.get("/user/:handle/history", getUserHistoryController);
  app.get("/user/:handle/stats", getUserStatsController);
  app.get("/videos", getVideosController);
  app.get("/youtube/artist-channel", authMiddleware, getYoutubeArtistChannelController);
  app.get("/stats", getServerStatsController);

  app.use(processErrorMiddleware);
  return app;
}
