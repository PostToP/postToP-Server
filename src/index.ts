import dotenv from "dotenv";
dotenv.config();
import { DatabaseManager } from "./database";
import { addWebsocketUpgradeHandler, setupWebSocketServer } from "./websocket";
import { setupAPIRoutes } from "./api/routes";
process.stdin.resume();

async function startServer(port: number) {
  await DatabaseManager.initialize()
  const express = setupAPIRoutes();
  const server = express.listen(port);
  console.log(`Server is running on port ${port}`);
  const wss = setupWebSocketServer();
  addWebsocketUpgradeHandler(server, wss);

  function exitHandler(signal?: string) {
    console.log(`Closing database and websocket${signal ? ` (${signal})` : ""}`);
    let dbClosed = DatabaseManager.close().then(() => {
      console.log("Database connection closed")
    });
    let expressClosed = server.close(() => {
      console.log("Express server closed");
    });
    let wsClosed = wss.close(() => {
      console.log("WebSocket server closed");
    });
    Promise.all([dbClosed, expressClosed, wsClosed]).then(() => {
      console.log("Cleanup completed");
    }).catch((error) => {
      console.error("Error during cleanup:", error);
    }).finally(() => {
      process.exit(1);
    });
  }

  process.on("SIGINT", () => exitHandler("SIGINT"));
  process.on("SIGTERM", () => exitHandler("SIGTERM"));

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    exitHandler("unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    exitHandler("uncaughtException");
  });

}


startServer(8000);
