import express, { Request, Response } from "npm:express@4.18.2";
import { IRequestQuery } from "../interface/interface.ts";
import { getLatestMusic, getTopMusic } from "../service/MusicService.ts";
import { getTopArtists } from "../service/ArtistService.ts";

export function startServer(port: number) {
  const app = express();

  app.get("/artist", (req: Request, res: Response) => {
    const query = req.query as IRequestQuery;
    const { from, to, limit = "5" } = query;
    res
      .status(200)
      .json(getTopArtists(new Date(from), new Date(to), parseInt(limit)));
    return;
  });

  app.get("/music", (req: Request, res: Response) => {
    const query = req.query as IRequestQuery;

    const { sortBy, from, to, limit = "5" } = query;

    if (sortBy === "top" || !sortBy) {
      res
        .status(200)
        .json(getTopMusic(new Date(from), new Date(to), parseInt(limit)));
    } else if (sortBy === "latest") {
      res
        .status(200)
        .json(getLatestMusic(new Date(from), new Date(to), parseInt(limit)));
    }

    return;
  });

  app.listen(port);
}
