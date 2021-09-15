import express, { Request, Response } from "express";

import dotenv from "dotenv";

import { mongoConnect } from "./database/mongo";

import mainRoutes from "./routes/routes";

dotenv.config();
mongoConnect();

const server = express();

server.use(mainRoutes);

server.listen(process.env.PORT, () => {
  console.log(`Rodando na porta: ${process.env.PORT}`);
});
