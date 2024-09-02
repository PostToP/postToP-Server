import dotenv from "dotenv";
dotenv.config();
import { startServer } from "./controller/express";
import { db } from "./model/db";
import { wss } from "./controller/websocket";

process.stdin.resume();

function exitHandler() {
  console.log("Closing database and websocket");
  db.close();
  wss.close();
  process.exit(0);
}

process.on("exit", exitHandler.bind(null));
process.on("SIGINT", exitHandler.bind(null));
process.on("SIGTERM", exitHandler.bind(null));

startServer(8000);
