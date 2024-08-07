import express, { Request, Response, NextFunction } from "npm:express@4.18.2";
import json from "npm:body-parser@1.19.0";
import cors from "npm:cors@2.8.5";
import { IRequestQuery } from "../interface/interface.ts";
import {
  filterMusic,
  getLatestMusic,
  getTopMusic,
} from "../service/MusicService.ts";
import { getTopArtists } from "../service/ArtistService.ts";
import { Validate } from "../utils.ts";
import { InvalidArgumentError } from "../interface/errors.ts";
import { all } from "../model/db.ts";

export function startServer(port: number) {
  const app = express();

  app.use(json());
  app.use(cors());

  app.get("/debug", (_req: Request, res: Response) => {
    res.status(200).json(all());
  });

  app.get("/artist", (req: Request, res: Response) => {
    const query = req.query as IRequestQuery;
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
    const query = req.query as IRequestQuery;

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
