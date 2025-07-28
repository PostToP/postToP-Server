import { wssServer } from "..";
import { ExtendedWebSocketConnection, OperationType, WebSocketPhase } from "../../interface/websocket";
import { listenedToMusic } from "../../services/music.service";
import { logger } from "../../utils/logger";

export function listenedToMusicWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    if (!ws.authenticated || ws.userId === undefined) {
        ws.send(JSON.stringify({
            op: OperationType.ERROR,
            d: { message: "User not authenticated" },
        }));
        logger.error(`User ${ws.userId} attempted to listen to music without authentication`);
        return;
    }

    listenedToMusic(data.watchID, ws.userId)
    announceSongToEvedroppers(ws.userId, data);
    ws.send(JSON.stringify({
        op: OperationType.MUSIC_LISTENED,
        d: { message: "Music listened successfully" },
    }));
    logger.info(`User ${ws.userId} listened to music successfully`);
}


// TODO: Replace this with some kind of event system or pub/sub pattern
// but this is fine for now
function announceSongToEvedroppers(userID: number, music: any) {
    wssServer.clients.forEach((client) => {
        // @ts-ignore
        if (client.readyState === WebSocket.OPEN && client.phase === WebSocketPhase.CONNECTED && client.userId === userID) {
            client.send(JSON.stringify({
                op: OperationType.MUSIC_LISTENED,
                d: {
                    userId: userID,
                    music: music,
                },
            }));
        }
    });
    logger.info(`Announced music listened by user ${userID} to eavesdroppers`);
}

export function eavesdropWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    ws.phase = WebSocketPhase.CONNECTED;
    // TODO: use more obscure user ID
    ws.userId = data.userId;
    ws.send(JSON.stringify({
        op: OperationType.EAVESDROP,
        d: { message: "Eavesdropping started" },
    }));
    //TODO: get currently playing music from eavesdroppee, needs redis server or jank dictionary
    logger.info(`User ${ws.userId} started eavesdropping`);
}