import type {Request, Response} from "express";
import {z} from "zod";
import {AuthService} from "../../services/auth.service";

const AuthRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function authRequestHandler(req: Request, res: Response) {
  const {username, password} = AuthRequestSchema.parse(req.body);

  const token = await AuthService.auth(username, password);
  return res.status(200).json({token});
}
