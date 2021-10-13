import express, { Request, Response, ErrorRequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { MulterError } from "multer";
import { mongoConnect } from "./database/mongo";
import userRoutes from "./routes/routes";
import publicationRoutes from "./routes/routesPublication";
import chatRoutes from "./routes/routesChat";
dotenv.config();
mongoConnect();

const server = express();

var corsOptions = {
  origin: "*",
};

server.use(cors(corsOptions));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "..", "public")));

server.use(userRoutes);
server.use(publicationRoutes);
server.use(chatRoutes);

server.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: "Erro!! Página não encontrada" });
});
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(400);
  console.log(err);
  if (err instanceof MulterError) {
    res.json({ error: err.code });
    return;
  }

  res.json({ error: err.message });
};

server.use(errorHandler);

server.listen(process.env.PORT || 80, () => {
  console.log(`Porta: ${process.env.PORT}`);
});
