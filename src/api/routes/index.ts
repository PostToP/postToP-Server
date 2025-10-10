import {json, urlencoded} from "body-parser";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "../../utils/swagger";
import {processErrorMiddleware} from "../middleware/error.middleware";
import {logRequestMiddleware} from "../middleware/logger.middleware";
import "express-async-errors";
import {toNodeHandler} from "better-auth/node";
import {auth} from "../../auth";
import {postIsMusicReviewRequestHandler, postNERReviewRequestHandler} from "../controllers/review.controller";
import {getUserController} from "../controllers/user.controller";
import {getVideosController} from "../controllers/video.controller";
import {authMiddleware} from "../middleware/auth.middleware";

export function setupAPIRoutes() {
  const app = express();

  app.use(cors({origin: "*", credentials: true}));
  app.all("/api/auth/*", toNodeHandler(auth));
  app.use(
    urlencoded({
      extended: true,
    }),
  );
  app.use(json());
  app.use(logRequestMiddleware);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.post("/review/music", authMiddleware, postIsMusicReviewRequestHandler);
  app.post("/review/ner", authMiddleware, postNERReviewRequestHandler);
  app.get("/user/:handle", getUserController);
  app.get("/videos", getVideosController);

  app.use(processErrorMiddleware);
  return app;
}
