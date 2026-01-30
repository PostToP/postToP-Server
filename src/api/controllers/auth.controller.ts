import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../../services/auth.service";

const AuthRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});


export async function authRequestHandler(req: Request, res: Response) {
  const { username, password } = AuthRequestSchema.parse(req.body);

  const loginInformation = await AuthService.auth(username, password);
  return res.status(200).json({
    token: loginInformation.token,
    user: loginInformation.user
  });
}

const RegisterRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().email(),
});

export async function registerRequestHandler(req: Request, res: Response) {
  const { username, password, email } = RegisterRequestSchema.parse(req.body);

  await AuthService.register(username, email, password);
  return res.status(201).json({ message: "User registered successfully" });
}