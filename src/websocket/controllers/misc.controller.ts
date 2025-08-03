import { wssServer } from "..";
import { UserQueries } from "../../database/queries/user.queries";
import { ExtendedWebSocketConnection, ResponseOperationType, WebSocketPhase } from "../../interface/websocket";
import { logger } from "../../utils/logger";

export function heartbeatWebsocketHandler(ws: ExtendedWebSocketConnection, data: any) {
    if (!ws.authenticated || ws.userId === undefined) {
        ws.send(JSON.stringify({
            op: ResponseOperationType.ERROR,
            d: { message: "User not authenticated" },
        }));
        return;
    }

    ws.send(JSON.stringify({
        op: ResponseOperationType.HEARTBEAT
    }));
}

// TODO: Replace this with some kind of event system or pub/sub pattern
// but this is fine for now
export function announceSongToEvedroppers(userID: number, music: any) {
    wssServer.clients.forEach((client) => {
        // @ts-ignore
        if (client.readyState === WebSocket.OPEN && client.phase === WebSocketPhase.CONNECTED && client.userId === userID) {
            client.send(JSON.stringify({
                op: ResponseOperationType.VIDEO_UPDATE,
                d: {
                    userId: userID,
                    ...music,
                },
            }));
        }
    });
    logger.info(`Announced music listened by user ${userID} to eavesdroppers`);
}

export async function eavesdropWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    clearTimeout(ws.disconnectTimeout);
    const user = await UserQueries.fetchByHandle(data.handle);

    if (!user) {
        ws.send(JSON.stringify({
            op: ResponseOperationType.ERROR,
            d: { message: "User not found" },
        }));
        logger.error(`Eavesdrop attempt failed for handle ${data.handle}: User not found`);
        return;
    }

    ws.phase = WebSocketPhase.CONNECTED;
    ws.userId = user.id;
    ws.send(JSON.stringify({
        op: ResponseOperationType.EAVESDROPPED,
        d: { message: "Eavesdropping started" },
    }));
    //TODO: get currently playing music from eavesdroppee, needs redis server or jank dictionary
    logger.info(`User ${ws.userId} started eavesdropping`);
}
