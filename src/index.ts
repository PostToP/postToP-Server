import dotenv from "dotenv";

dotenv.config();

import {setupAPIRoutes} from "./api/routes";
import {DatabaseManager} from "./database";
import {logger} from "./utils/logger";
import {addWebsocketUpgradeHandler, setupWebSocketServer} from "./websocket";

process.stdin.resume();

async function startServer(port: number) {
  await DatabaseManager.initialize();
  const express = setupAPIRoutes();
  const server = express.listen(port);
  logger.info(`Server is running on port ${port}`);
  const wss = setupWebSocketServer();
  addWebsocketUpgradeHandler(server, wss);

  function exitHandler(signal?: string) {
    logger.warn(`Closing database and websocket${signal ? ` (${signal})` : ""}`);
    const dbClosed = DatabaseManager.close().then(() => {
      logger.warn("Database connection closed");
    });
    const expressClosed = server.close(() => {
      logger.warn("Express server closed");
    });
    const wsClosed = wss.close(() => {
      logger.warn("WebSocket server closed");
    });
    Promise.all([dbClosed, expressClosed, wsClosed])
      .then(() => {
        logger.warn("Cleanup completed");
      })
      .catch(error => {
        logger.error("Error during cleanup:", error);
      })
      .finally(() => {
        process.exit(1);
      });
  }

  process.on("SIGINT", () => exitHandler("SIGINT"));
  process.on("SIGTERM", () => exitHandler("SIGTERM"));

  process.on("unhandledRejection", (reason, promise) => {
    logger.error(
      {
        reason:
          reason instanceof Error
            ? {
                message: reason.message,
                stack: reason.stack,
                name: reason.name,
              }
            : reason,
        promise: promise,
      },
      "Unhandled Promise Rejection",
    );

    if (process.env.NODE_ENV !== "production") {
      logger.error("Full promise details:", promise);
      exitHandler("unhandledRejection");
    }
  });

  process.on("uncaughtException", error => {
    logger.error("Uncaught Exception:", error);
    if (process.env.NODE_ENV !== "production") {
      exitHandler("uncaughtException");
    }
  });
}

startServer(8000);
