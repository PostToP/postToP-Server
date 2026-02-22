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
    const musicInDatabase = VideoQueries.numberOfMusicVideos();
    const artistsInDatabase = ArtistQueries.numberOfArtists();
    const totalListenedHours = UserQueries.getTotalListenedHours();

    return {
      activeUsers: currentActiveUsers,
      connectedUsers: numberOfConnectedUsers,
      musicVideos: await musicInDatabase,
      musicArtists: await artistsInDatabase,
      totalListenedHours: await totalListenedHours,
    };
  }
}
