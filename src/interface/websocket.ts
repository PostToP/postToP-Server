import { WebSocket } from "ws";

export enum OperationType {
    DECLARE_INTENT = 0,
    AUTH = 1,
    EAVESDROP = 2,
    PING = 3,
    PONG = 4,
    MUSIC_LISTENED = 5,
    ERROR = 400
}

export enum WebSocketPhase {
    DECLARE_INTENT = 0,
    CONNECTED = 1,
}

export interface WebSocketRequest {
    op: OperationType;
    d: any;
}

export interface WebSocketResponse {
    op: OperationType;
    d: object;
    phase: WebSocketPhase;
}


export interface ExtendedWebSocketConnection extends WebSocket {
    userId: number | undefined;
    phase: WebSocketPhase;
    authenticated: boolean;
    disconnectTimeout?: NodeJS.Timeout;
}