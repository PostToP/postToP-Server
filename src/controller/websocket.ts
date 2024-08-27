import { WebSocketServer } from "ws";
import { IRequest, IRequestMusic, MessageType } from "../interface/interface";
import { listenedToMusic } from "../service/MusicService";

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port: port });
  wss.on("connection", function (ws: any) {
    console.log(`New connection`);
    ws.on("message", async function (message: string) {
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
}
