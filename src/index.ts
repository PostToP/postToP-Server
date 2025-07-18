import dotenv from "dotenv";
dotenv.config();
import { DatabaseManager } from "./database";
import { addWebsocketUpgradeHandler, setupWebSocketServer } from "./websocket";
import { setupAPIRoutes } from "./api/routes";
import { logger } from "./utils/logger";
process.stdin.resume();

async function startServer(port: number) {
  await DatabaseManager.initialize()
  const express = setupAPIRoutes();
  const server = express.listen(port);
  logger.info(`Server is running on port ${port}`);
  const wss = setupWebSocketServer();
  addWebsocketUpgradeHandler(server, wss);

  function exitHandler(signal?: string) {
    logger.warn(`Closing database and websocket${signal ? ` (${signal})` : ""}`);
    let dbClosed = DatabaseManager.close().then(() => {
      logger.warn("Database connection closed")
    });
    let expressClosed = server.close(() => {
      logger.warn("Express server closed");
    });
    let wsClosed = wss.close(() => {
      logger.warn("WebSocket server closed");
    });
    Promise.all([dbClosed, expressClosed, wsClosed]).then(() => {
      logger.warn("Cleanup completed");
    }).catch((error) => {
      logger.error("Error during cleanup:", error);
    }).finally(() => {
      process.exit(1);
    });
  }

  process.on("SIGINT", () => exitHandler("SIGINT"));
  process.on("SIGTERM", () => exitHandler("SIGTERM"));

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    exitHandler("unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    exitHandler("uncaughtException");
  });

}


startServer(8000);
