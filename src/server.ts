import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

import { mongoConnect } from "./database/mongo";

import mainRoutes from "./routes/routes";

dotenv.config();
mongoConnect();

const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "../public")));

server.use(mainRoutes);

server.listen(process.env.PORT, () => {
  console.log(`Rodando na porta: ${process.env.PORT}`);
});
