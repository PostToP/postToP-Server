export enum MessageType {
  MUSIC = "MUSIC_LISTENED",
  PING = "PING",
  PONG = "PONG",
}

export interface IRequest {
  type: MessageType;
  payload?: IRequestMusic | object;
}

export interface IRequestMusic {
  watchID: string;
  artistID: string;
}

export interface IRequestQuery {
  sortBy: "top" | "latest";
  from: string;
  to: string;
  limit: string;
}
