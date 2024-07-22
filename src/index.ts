import { startServer } from "./controller/express.ts";
import { startWebSocketServer } from "./controller/websocket.ts";

startWebSocketServer(8080);
startServer(8000);
