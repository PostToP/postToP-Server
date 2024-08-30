import dotenv from "dotenv";
dotenv.config();
import { startServer } from "./controller/express";

startServer(8000);
