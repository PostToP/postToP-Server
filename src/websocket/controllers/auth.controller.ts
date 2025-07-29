import { ExtendedWebSocketConnection, ResponseOperationType, WebSocketPhase } from "../../interface/websocket";
import { verifyToken } from "../../services/auth.service";
import { logger } from "../../utils/logger";

export function authWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    clearTimeout(ws.disconnectTimeout);
    let verifiedToken = verifyToken(data.token);
    if (!verifiedToken.ok) {
        ws.send(JSON.stringify({
            op: ResponseOperationType.ERROR,
            d: { message: "Authentication failed" },
        }));
        ws.close();
        logger.error(`Authentication failed for user ${ws.userId}`);
        return;
    }
    ws.phase = WebSocketPhase.CONNECTED;
    ws.userId = verifiedToken.data?.userId;
    ws.authenticated = true;
    ws.send(JSON.stringify({
        op: ResponseOperationType.AUTHENTICATED,
        d: { message: "Authenticated successfully" },
    }));
    logger.info(`User ${ws.userId} authenticated successfully`);
    return;
}
