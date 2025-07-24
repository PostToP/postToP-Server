import { WebSocketServer, WebSocket, RawData } from "ws";
import { IncomingMessage, Server } from "http";
import { logger } from "../utils/logger";
import { ExtendedWebSocketConnection, OperationType, WebSocketPhase, WebSocketRequest } from "../interface/websocket";
import { authWebsocketHandler } from "./controllers/auth.controller";
import { eavesdropWebsocketHandler, listenedToMusicWebsocketHandler } from "./controllers/music.controller";

export function setupWebSocketServer() {
  const wss = new WebSocketServer({ noServer: true });
  wss.on("connection", websocketConnectionHandler);
  return wss;
}

function websocketConnectionHandler(
  ws: ExtendedWebSocketConnection,
  _req: IncomingMessage
) {
  ws.send(JSON.stringify({
    op: OperationType.DECLARE_INTENT,
    d: {
      message: "Waiting for declaration of intent, authenticate or eavesdrop",
    },
  }));
  ws.phase = WebSocketPhase.DECLARE_INTENT;
  ws.authenticated = false;
  ws.userId = undefined;
  ws.on("message", (m) => webSocketMessageHandler(ws, m));
  ws.on("error", webSocketErrorHandler);
  ws.on("close", webSocketCloseHandler);
}

async function webSocketMessageHandler(ws: ExtendedWebSocketConnection, message: RawData) {
  logger.info(`Received message from userId ${ws.userId}: ${message}`);
  const json = JSON.parse(message.toString()) as WebSocketRequest;

  logger.info(json);
  const phase = ws.phase;
  const operation = json.op;
  const data = json.d;

  const operations: any = {
    [WebSocketPhase.DECLARE_INTENT]: {
      [OperationType.AUTH]: authWebsocketHandler,
      [OperationType.EAVESDROP]: eavesdropWebsocketHandler,
    },
    [WebSocketPhase.CONNECTED]: {
      [OperationType.MUSIC_LISTENED]: listenedToMusicWebsocketHandler,
    }
  };

  if (!(operations[phase] && operations[phase][operation])) {
    logger.warn(`Unknown operation ${operation} in phase ${phase} for userId ${ws.userId}`);
    ws.send(JSON.stringify({
      op: OperationType.ERROR,
      d: { message: "Unknown operation" },
    }));
    return;
  }
  try {
    await operations[phase][operation](ws, data);
  } catch (error) {
    logger.error(`Error processing operation ${operation} for userId ${ws.userId}:`, error);
    ws.send(JSON.stringify({
      op: OperationType.ERROR,
      d: { message: "An error occurred while processing your request" },
    }));
  }
}

function webSocketErrorHandler(error: Error) {
  logger.error("WebSocket error:", error);
}

function webSocketCloseHandler(ws: ExtendedWebSocketConnection) {
  logger.info(`WebSocket connection closed for userId: ${ws.userId}`);
}


export function addWebsocketUpgradeHandler(server: Server, wss: WebSocketServer) {
  server.on("upgrade", (req: IncomingMessage, socket: any, head: any) => {
    wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
      wss.emit("connection", ws, req);
    });
  });
}