import {ArtistQueries} from "../database/queries/artist.queries";
import {UserQueries} from "../database/queries/user.queries";
import {VideoQueries} from "../database/queries/video.queries";
import {ExtendedWebSocketConnection} from "../interface/websocket";
import {wssServer} from "../websocket";

export class StatsService {
  static async getServerStats() {
    const currentActiveUsers = wssServer.clients.size;
    const numberOfConnectedUsers = Array.from(wssServer.clients).filter(
      client => (client as ExtendedWebSocketConnection).authenticated,
    ).length;
    const [
      musicInDatabase,
      artistsInDatabase,
      totalListenedHours,
      reviewedVideos,
      predictedVideos,
      totalVideos,
      reviewedGenres,
      predictedGenres,
      reviewedNER,
      predictedNER,
    ] = await Promise.all([
      VideoQueries.numberOfMusicVideos(),
      ArtistQueries.numberOfArtists(),
      UserQueries.getTotalListenedHours(),
      VideoQueries.numberOfReviewedVideos(),
      VideoQueries.numberOfPredictedVideos(),
      VideoQueries.numberOfVideosTotal(),
      VideoQueries.numberOfReviewedGenres(),
      VideoQueries.numberOfPredictedGenres(),
      VideoQueries.numberOfReviewedNER(),
      VideoQueries.numberOfPredictedNER(),
    ]);

    return {
      activeUsers: currentActiveUsers,
      connectedUsers: numberOfConnectedUsers,
      musicVideos: musicInDatabase,
      musicArtists: artistsInDatabase,
      totalListenedHours: totalListenedHours,
      is_music: {
        reviewed: reviewedVideos,
        predicted: predictedVideos,
      },
      genres: {
        reviewed: reviewedGenres,
        predicted: predictedGenres,
      },
      ner: {
        reviewed: reviewedNER,
        predicted: predictedNER,
      },
      totalVideos: totalVideos,
    };
  }
}
