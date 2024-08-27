import express, { Request, Response, NextFunction } from "express";
import { urlencoded, json } from "body-parser";
import cors from "cors";
import { IRequestQuery } from "../interface/interface";
import {
  filterMusic,
  getLatestMusic,
  getTopMusic,
} from "../service/MusicService";
import { getTopArtists } from "../service/ArtistService";
import { Validate } from "../utils";
import { InvalidArgumentError } from "../interface/errors";
import { all } from "../model/db";
import { getTopGenres } from "../service/GenreService";

export function startServer(port: number) {
  const app = express();

  app.use(
    urlencoded({
      extended: true,
    })
  );
  app.use(json());
  app.use(cors());

  app.get("/debug", (_req: Request, res: Response) => {
    res.status(200).json(all());
  });

  app.get("/artist", (req: Request, res: Response) => {
    const query = req.query;
    let from = Validate(query?.from)
      .nonRequired(new Date())
      .date("from is invalid")
      .unwrap<Date>();
    let to = Validate(query?.to)
      .nonRequired(new Date())
      .date("to is invalid")
      .unwrap<Date>();
    const limit = Validate(query?.limit)
      .nonRequired(5)
      .number("limit must be a number")
      .unwrap<number>();

    if (to > from) {
      const temp = from;
      from = to;
      to = temp;
    }

    res.status(200).json(getTopArtists(new Date(from), new Date(to), limit));
    return;
  });

  app.get("/music", (req: Request, res: Response) => {
    const query = req.query;

    const sortBy = Validate(query?.sortBy)
      .nonRequired("top")
      ?.string("sortBy must be a string")
      .in(["top", "latest"], "sortBy is invalid")
      .unwrap<"top" | "latest">();
    let from = Validate(query?.from)
      .nonRequired(new Date())
      .date("from is invalid")
      .unwrap<Date>();
    let to = Validate(query?.to)
      .nonRequired(new Date())
      .date("to is invalid")
      .unwrap<Date>();
    const limit = Validate(query?.limit)
      .nonRequired(5)
      .number("limit must be a number")
      .unwrap<number>();
    if (to > from) {
      const temp = from;
      from = to;
      to = temp;
    }
    if (sortBy === "top")
      return res
        .status(200)
        .json(getTopMusic(new Date(from), new Date(to), limit));
    if (sortBy === "latest") return res.status(200).json(getLatestMusic(limit));
  });

  app.get("/genre", (req: Request, res: Response) => {
    const query = req.query;
    let from = Validate(query?.from)
      .nonRequired(new Date())
      .date("from is invalid")
      .unwrap<Date>();
    let to = Validate(query?.to)
      .nonRequired(new Date())
      .date("to is invalid")
      .unwrap<Date>();
    const limit = Validate(query?.limit)
      .nonRequired(5)
      .number("limit must be a number")
      .unwrap<number>();

    if (to > from) {
      const temp = from;
      from = to;
      to = temp;
    }

    res.status(200).json(getTopGenres(new Date(from), new Date(to), limit));
    return;
  });

  app.post("/filter", (req: Request, res: Response) => {
    const body = req.body as { watchID: string };

    Validate(body?.watchID)
      .required("watchID is required")
      .string("watchID must be a string")
      .regex(/^[a-zA-Z0-9_-]{11}$/, "watchID is invalid");

    filterMusic(body.watchID);
    return res.status(200).json({ message: "Filtered" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof InvalidArgumentError) {
      res.status(400).json({ message: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  });

  app.listen(port);
}
