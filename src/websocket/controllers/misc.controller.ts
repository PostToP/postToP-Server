import { WebSocket } from "ws";
import { UserQueries } from "../../database/queries/user.queries";
import { type ExtendedWebSocketConnection, ResponseOperationType, WebSocketPhase } from "../../interface/websocket";
import { logger } from "../../utils/logger";
import { wssServer } from "..";

export function heartbeatWebsocketHandler(ws: ExtendedWebSocketConnection, _data: any) {
  if (!ws.authenticated || ws.userId === undefined) {
    ws.send(
      JSON.stringify({
        op: ResponseOperationType.ERROR,
        d: { message: "User not authenticated" },
      }),
    );
    return;
  }

  ws.send(
    JSON.stringify({
      op: ResponseOperationType.HEARTBEAT,
    }),
  );
}

// TODO: Replace this with some kind of event system or pub/sub pattern
// but this is fine for now
export function announceSongToEvedroppers(userID: number, music: any) {
  wssServer.clients.forEach(client => {
    // @ts-expect-error
    if (client.readyState === WebSocket.OPEN && client.phase === WebSocketPhase.CONNECTED && client.userId === userID) {
      client.send(
        JSON.stringify({
          op: ResponseOperationType.VIDEO_UPDATE,
          d: {
            userId: userID,
            ...music,
          },
        }),
      );
    }
  });
  logger.info(`Announced music listened by user ${userID} to eavesdroppers`);
}

export async function eavesdropWebsocketHandler(ws: ExtendedWebSocketConnection, data: any) {
  clearTimeout(ws.disconnectTimeout);
  const user = await UserQueries.fetchBy(data.handle, "handle");

  if (!user) {
    ws.send(
      JSON.stringify({
        op: ResponseOperationType.ERROR,
        d: { message: "User not found" },
      }),
    );
    logger.error(`Eavesdrop attempt failed for handle ${data.handle}: User not found`);
    return;
  }

  ws.phase = WebSocketPhase.CONNECTED;
  ws.userId = user.id;
  ws.send(
    JSON.stringify({
      op: ResponseOperationType.EAVESDROPPED,
      d: { message: "Eavesdropping started" },
    }),
  );
  //TODO: get currently playing music from eavesdroppee, needs redis server or jank dictionary
  logger.info(`User ${ws.userId} started eavesdropping`);
}
