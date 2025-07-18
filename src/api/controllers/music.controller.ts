import { Request, Response } from "express";
import { Validate } from "../../utils/validator";
import { filterMusic, getLatestMusic, getTopMusic } from "../../services/music.service";


export async function getMusicRequestHandler(req: Request, res: Response) {
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
            .json(await getTopMusic(new Date(from), new Date(to), limit));
    if (sortBy === "latest") return res.status(200).json(await getLatestMusic(limit));
}

export async function filterMusicRequestHandler(req: Request, res: Response) {
    const body = req.body as { watchID: string };

    Validate(body?.watchID)
        .required("watchID is required")
        .string("watchID must be a string")
        .regex(/^[a-zA-Z0-9_-]{11}$/, "watchID is invalid");

    await filterMusic(body.watchID);
    return res.status(200).json({ message: "Filtered" });
}