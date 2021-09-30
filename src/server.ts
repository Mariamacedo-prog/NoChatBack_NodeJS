import express, { Request, Response, ErrorRequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { MulterError } from "multer";
import { mongoConnect } from "./database/mongo";
import mainRoutes from "./routes/routes";
import chatRoutes from "./routes/chatRoutes";
dotenv.config();
mongoConnect();
//
const server = express();

var corsOptions = {
  origin: "*",
};

server.use(cors(corsOptions));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "..", "public")));

server.use(mainRoutes);
server.use(chatRoutes);

server.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: "Erro!! Página encontrada" });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(400);

  if (err instanceof MulterError) {
    res.json({ error: err.code });
  }
  console.log(err);
  res.json({ error: "Ocorreu um erro" });
};

server.use(errorHandler);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Porta: ${process.env.PORT}`);
});
