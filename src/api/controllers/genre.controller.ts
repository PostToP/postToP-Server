import { Request, Response } from "express";
import { Validate } from "../../utils/validator";
import { getTopGenres } from "../../services/genre.service";

export async function getGenresRequestHandler(req: Request, res: Response) {
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

    res.status(200).json(await getTopGenres(new Date(from), new Date(to), limit));
    return;
}