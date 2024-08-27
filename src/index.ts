import dotenv from "dotenv";
dotenv.config();
import { startServer } from "./controller/express";
import { startWebSocketServer } from "./controller/websocket";

startWebSocketServer(8080);
startServer(8000);
