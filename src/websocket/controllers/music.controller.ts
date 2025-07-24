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

    listenedToMusic(data, ws.userId)
    ws.send(JSON.stringify({
        op: OperationType.MUSIC_LISTENED,
        d: { message: "Music listened successfully" },
    }));
    logger.info(`User ${ws.userId} listened to music successfully`);
}

export function eavesdropWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    ws.phase = WebSocketPhase.CONNECTED;
    ws.send(JSON.stringify({
        op: OperationType.EAVESDROP,
        d: { message: "Eavesdropping started" },
    }));
    //TODO
    logger.info(`User ${ws.userId} started eavesdropping`);
}