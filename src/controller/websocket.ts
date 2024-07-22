import {
  WebSocketClient,
  WebSocketServer,
} from "https://deno.land/x/websocket@v0.1.4/mod.ts";
import {
  IRequest,
  IRequestMusic,
  MessageType,
} from "../interface/interface.ts";
import { InsertNewMusic } from "../service/MusicService.ts";

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer(port);
  wss.on("connection", function (ws: WebSocketClient) {
    console.log(`New connection`);
    ws.on("message", function (message: string) {
      const json = JSON.parse(message) as IRequest;
      console.log(json);

      switch (json.type) {
        case MessageType.PING:
          ws.send(JSON.stringify({ type: MessageType.PONG }));
          break;
        case MessageType.MUSIC:
          InsertNewMusic(json.payload as IRequestMusic);
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
}
