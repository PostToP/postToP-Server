import { ExtendedWebSocketConnection, ResponseOperationType } from "../../interface/websocket";

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