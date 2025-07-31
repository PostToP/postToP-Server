import { WebSocket } from "ws";

export enum RequestOperationType {
    AUTH = 1,
    EAVESDROP = 2,
    HEARTBEAT = 3,
    MUSIC_STARTED = 4,
    MUSIC_UPDATE = 5,
    MUSIC_ENDED = 6,
}

export enum ResponseOperationType {
    DECLARE_INTENT = 100,
    AUTHENTICATED = 101,
    EAVESDROPPED = 102,
    PONG = 103,
    MUSIC_STARTED = 104,
    MUSIC_UPDATE = 105,
    MUSIC_ENDED = 106,
    REQUEST_STATUS = 107,
    ERROR = 400,
}

export enum WebSocketPhase {
    DECLARE_INTENT = 0,
    CONNECTED = 1,
}

export interface WebSocketRequest {
    op: RequestOperationType;
    d: WebsocketData;
}

export interface WebSocketResponse {
    op: ResponseOperationType;
    d: WebsocketData;
}


export interface ExtendedWebSocketConnection extends WebSocket {
    userId: number | undefined;
    phase: WebSocketPhase;
    authenticated: boolean;
    disconnectTimeout?: NodeJS.Timeout;
}

interface WebsocketData extends Object { }

export interface VideoRequestData extends WebsocketData {
    watchID: string;
    currentTime: number;
    status: VideoStatus;
}

export interface VideoResponseData extends WebsocketData {
    watchID: string;
    title: string;
    artist: {
        name: string;
        handle: string;
    },
    duration: number;
    coverImage: string;
    isMusic: boolean;
}

export interface ListeingData extends WebsocketData {
    currentTime: number;
    status: VideoStatus;
    updatedAt: Date;
}


export enum VideoStatus {
    PLAYING,
    PAUSED,
    ENDED,
}
