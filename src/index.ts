import dotenv from "dotenv";
dotenv.config();
import { db } from "./database";
import { wss } from "./websocket/websocket";
import { parse } from "url";
import { IncomingMessage } from "http";
import { setupRoutes } from "./api/routes";
process.stdin.resume();

async function exitHandler(signal?: string) {
  console.log(`Closing database and websocket${signal ? ` (${signal})` : ""}`);
  try {
    await db.destroy();
    wss.close();
    console.log("Cleanup completed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
  process.exit(0);
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


export interface AuthenticatedRequest extends IncomingMessage {
  isAuthenticated?: boolean;
}

export function startServer(port: number) {
  const express = setupRoutes();
  const server = express.listen(port);
  server.on("upgrade", (req: AuthenticatedRequest, socket, head) => {
    req.isAuthenticated = authenticate(req);

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
}

function authenticate(request: IncomingMessage) {
  if (!request.url) return false;
  const { token } = parse(request.url, true).query;
  return token === process.env.TOKEN;
}

startServer(8000);
