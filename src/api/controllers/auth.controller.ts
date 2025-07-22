import { Request, Response } from 'express';
import { authenticateUser } from '../../services/auth.service';


export async function authRequestHandler(req: Request, res: Response) {
    const query = req.query;
    const username = query.username as string;
    const password = query.password as string;

    const token = await authenticateUser(username, password)
    res.status(200).json({ token });
    return;
}