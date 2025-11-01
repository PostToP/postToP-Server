import type {Transaction} from "kysely";
import {ArtistQueries} from "../database/queries/artist.queries";
import type {DB} from "../model/db";
import {YouTubeService} from "./youtube.service";

export class ChannelService {
  static async getOrFetch(trx: Transaction<DB>, yt_id: string) {
    const exists = await ArtistQueries.fetchByYTID(yt_id);
    if (exists) {
      return exists;
    }
    const ytData = await YouTubeService.fetchArtistChannelDetails(yt_id);
    const username = ytData.items[0].snippet.title;
    const profile_picture_uri = ytData.items[0].snippet.thumbnails.high.url;
    const insertedChannel = await ArtistQueries.insert(trx, yt_id, username, profile_picture_uri);
    return insertedChannel;
  }
}
