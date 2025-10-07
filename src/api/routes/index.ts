import {json, urlencoded} from "body-parser";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "../../utils/swagger";
import {authRequestHandler} from "../controllers/auth.controller";
import {processErrorMiddleware} from "../middleware/error.middleware";
import {logRequestMiddleware} from "../middleware/logger.middleware";
import "express-async-errors";
import {postIsMusicReviewRequestHandler, postNERReviewRequestHandler} from "../controllers/review.controller";
import {getUserController} from "../controllers/user.controller";
import {getVideosController} from "../controllers/video.controller";
import {authMiddleware} from "../middleware/auth.middelware";

export function setupAPIRoutes() {
  const app = express();

  app.use(
    urlencoded({
      extended: true,
    }),
  );
  app.use(json());
  app.use(cors());
  app.use(logRequestMiddleware);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.post("/auth", authRequestHandler);
  app.post("/review/music", authMiddleware, postIsMusicReviewRequestHandler);
  app.post("/review/ner", authMiddleware, postNERReviewRequestHandler);
  app.get("/user/:handle", getUserController);
  app.get("/videos", getVideosController);

  app.use(processErrorMiddleware);
  return app;
}
