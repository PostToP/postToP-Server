import dotenv from "dotenv";
dotenv.config();
import { startServer } from "./controller/express";
import { db } from "./model/db";
import { wss } from "./controller/websocket";

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

startServer(8000);
