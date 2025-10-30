import type {Request, Response} from "express";
import {AuthService} from "../../services/auth.service";

export async function authRequestHandler(req: Request, res: Response) {
  const body = req.body;
  const username = body.username as string;
  const password = body.password as string;

  const token = await AuthService.auth(username, password);
  res.status(200).json({token});
  return;
}
