import { WebSocketServer } from "ws";
import { IRequest, IRequestMusic, MessageType } from "../interface/interface";
import { listenedToMusic } from "../service/MusicService";
import { AuthenticatedRequest } from "./express";

export const wss = new WebSocketServer({ noServer: true });
wss.on("connection", function (ws: any, req: AuthenticatedRequest) {
  console.log(`New connection`);
  ws.on("message", async function (message: string) {
    // Unauthenticated clients can't send messages
    if (req.isAuthenticated === false) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: "Not authenticated",
        })
      );
      return;
    }
    const json = JSON.parse(message) as IRequest;
    console.log(json);

    switch (json.type) {
      case MessageType.PING:
        ws.send(JSON.stringify({ type: MessageType.PONG }));
        break;
      case MessageType.MUSIC:
        await listenedToMusic(json.payload as IRequestMusic);
        break;
      default:
        break;
    }
  });
  ws.on("error", function (error: Error) {
    console.error(error);
  });
  ws.on("close", function () {
    console.log("Connection closed");
  });
});
