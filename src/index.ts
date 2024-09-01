import dotenv from "dotenv";
dotenv.config();
import { startServer } from "./controller/express";
import { db } from "./model/db";
import { wss } from "./controller/websocket";

startServer(8000);

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  wss.close(() => {
    console.log("Websocket server closed");
    db.close();
    process.exit(0);
  });
});
