import {VideoQueries} from "../../database/queries/video.queries";
import {
  type ExtendedWebSocketConnection,
  type ListeingData,
  ResponseOperationType,
  type VideoRequestData,
  type VideoResponseData,
  VideoStatus,
} from "../../interface/websocket";
import {MusicService} from "../../services/music.service";
import {VideoService} from "../../services/video.service";
import {logger} from "../../utils/logger";
import {announceSongToEvedroppers} from "./misc.controller";

export function videoUpdateWebsocketHandler(ws: ExtendedWebSocketConnection, data: VideoRequestData) {
  if (!ws.authenticated || ws.userId === undefined) {
    ws.send(
      JSON.stringify({
        op: ResponseOperationType.ERROR,
        d: {message: "User not authenticated"},
      }),
    );
    logger.error(`User ${ws.userId} attempted to update video without authentication`);
    return;
  }

  const videoStatus = data.status;
  switch (videoStatus) {
    case VideoStatus.STARTED:
      startedListeningToMusicWebsocketHandler(ws, data);
      break;
    case VideoStatus.PLAYING:
    case VideoStatus.PAUSED:
      announceSongToEvedroppers(ws.userId, data);
      break;
    case VideoStatus.ENDED:
      listenedToMusicWebsocketHandler(ws, data);
      break;
    default:
      ws.send(
        JSON.stringify({
          op: ResponseOperationType.ERROR,
          d: {message: "Invalid video status"},
        }),
      );
      logger.error(`User ${ws.userId} sent invalid video status: ${videoStatus}`);
      break;
  }
}

async function listenedToMusicWebsocketHandler(ws: ExtendedWebSocketConnection, data: any) {
  const videoID = await VideoService.getOrFetch(data.watchID);
  const isMusic = await MusicService.getVideoIsMusic(videoID);
  if (!isMusic.is_music) return;
  if (ws.userId === undefined) {
    logger.error("ws.userId is undefined in listenedToMusicWebsocketHandler");
    return;
  }
  MusicService.recordListened(data.watchID, ws.userId);
  announceSongToEvedroppers(ws.userId, data);
  ws.send(
    JSON.stringify({
      op: ResponseOperationType.VIDEO_UPDATE,
      d: {message: "Music listened successfully"},
    }),
  );
  logger.info(`User ${ws.userId} listened to music successfully`);
}

async function startedListeningToMusicWebsocketHandler(ws: ExtendedWebSocketConnection, data: VideoRequestData) {
  if (data.watchID === undefined || data.watchID === "") {
    ws.send(
      JSON.stringify({
        op: ResponseOperationType.ERROR,
        d: {message: "Invalid watchID"},
      }),
    );
    logger.error(`User ${ws.userId} sent invalid watchID`);
    return;
  }

  const videoID = await VideoService.getOrFetch(data.watchID);
  const isMusic = await MusicService.getVideoIsMusic(videoID);
  const videoData = await VideoQueries.fetchDataAll(videoID);

  if (!videoData) {
    return;
  }

  const responseVideo: VideoResponseData = {
    watchID: data.watchID,
    title: videoData.title,
    artist: {
      name: videoData.name,
      handle: videoData.yt_id,
    },
    duration: videoData.duration,
    coverImage: `https://i.ytimg.com/vi/${data.watchID}/hqdefault.jpg`,
    isMusic: isMusic,
  };

  ws.send(
    JSON.stringify({
      op: ResponseOperationType.VIDEO_UPDATE,
      d: {
        video: responseVideo,
      },
    }),
  );
  logger.info(`User ${ws.userId} started listening to music successfully`);

  const listeningData: ListeingData = {
    currentTime: data.currentTime,
    status: data.status,
    updatedAt: new Date(),
  };

  if (!isMusic.is_music) return;

  if (ws.userId === undefined) {
    logger.error("ws.userId is undefined in startedListeningToMusicWebsocketHandler");
    return;
  }

  announceSongToEvedroppers(ws.userId, {
    video: responseVideo,
    listeningData: listeningData,
  });
}
