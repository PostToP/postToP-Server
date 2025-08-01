import { wssServer } from "..";
import { fetchIsMusic, fetchVideoDataAll } from "../../database/queries/video.queries";
import { ExtendedWebSocketConnection, ListeingData, ResponseOperationType, VideoRequestData, VideoResponseData, VideoStatus, WebSocketPhase } from "../../interface/websocket";
import { getOrFetchVideo, listenedToMusic } from "../../services/music.service";
import { logger } from "../../utils/logger";

export function videoUpdateWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: VideoRequestData,
) {
    if (!ws.authenticated || ws.userId === undefined) {
        ws.send(JSON.stringify({
            op: ResponseOperationType.ERROR,
            d: { message: "User not authenticated" },
        }));
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
            announceSongToEvedroppers(ws.userId!, data);
            break;
        case VideoStatus.ENDED:
            listenedToMusicWebsocketHandler(ws, data);
            break;
        default:
            ws.send(JSON.stringify({
                op: ResponseOperationType.ERROR,
                d: { message: "Invalid video status" },
            }));
            logger.error(`User ${ws.userId} sent invalid video status: ${videoStatus}`);
            break;
    }
}


function listenedToMusicWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    listenedToMusic(data.watchID, ws.userId!)
    announceSongToEvedroppers(ws.userId!, data);
    ws.send(JSON.stringify({
        op: ResponseOperationType.VIDEO_UPDATE,
        d: { message: "Music listened successfully" },
    }));
    logger.info(`User ${ws.userId} listened to music successfully`);
}


async function startedListeningToMusicWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: VideoRequestData,
) {
    const videoID = await getOrFetchVideo(data.watchID);
    const isMusic = await fetchIsMusic(videoID);
    const videoData = await fetchVideoDataAll(videoID);

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
        coverImage: "https://i.ytimg.com/vi/" + data.watchID + "/hqdefault.jpg",
        isMusic: isMusic !== null,
    };

    ws.send(JSON.stringify({
        op: ResponseOperationType.VIDEO_UPDATE,
        d: {
            video: responseVideo,
        },
    }));
    logger.info(`User ${ws.userId} started listening to music successfully`);

    const listeningData: ListeingData = {
        currentTime: data.currentTime,
        status: data.status,
        updatedAt: new Date(),
    };

    if (!isMusic)
        return;

    announceSongToEvedroppers(ws.userId!, {
        video: responseVideo,
        listeningData: listeningData,
    });
}


// TODO: Replace this with some kind of event system or pub/sub pattern
// but this is fine for now
function announceSongToEvedroppers(userID: number, music: any) {
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

export function eavesdropWebsocketHandler(
    ws: ExtendedWebSocketConnection,
    data: any,
) {
    clearTimeout(ws.disconnectTimeout);
    ws.phase = WebSocketPhase.CONNECTED;
    // TODO: use more obscure user ID
    ws.userId = data.userId;
    ws.send(JSON.stringify({
        op: ResponseOperationType.EAVESDROPPED,
        d: { message: "Eavesdropping started" },
    }));
    //TODO: get currently playing music from eavesdroppee, needs redis server or jank dictionary
    logger.info(`User ${ws.userId} started eavesdropping`);
}
