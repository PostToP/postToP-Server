import { ExtendedWebSocketConnection, OperationType, WebSocketPhase } from "../../interface/websocket";
import { verifyToken } from "../../services/auth.service";
import { logger } from "../../utils/logger";

export function authWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    let verifiedToken = verifyToken(data.token);
    if (!verifiedToken.ok) {
        ws.send(JSON.stringify({
            op: OperationType.ERROR,
            d: { message: "Authentication failed" },
        }));
        logger.error(`Authentication failed for user ${ws.userId}`);
        return;
    }
    ws.phase = WebSocketPhase.CONNECTED;
    ws.userId = verifiedToken.data?.userId;
    ws.authenticated = true;
    ws.send(JSON.stringify({
        op: OperationType.AUTH,
        d: { message: "Authenticated successfully" },
    }));
    logger.info(`User ${ws.userId} authenticated successfully`);
    return;
}
