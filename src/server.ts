import express, { Request, Response, ErrorRequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { MulterError } from "multer";
import { mongoConnect } from "./database/mongo";
import { Server } from "socket.io";
import http from "http";
import userRoutes from "./routes/routes";
import publicationRoutes from "./routes/routesPublication";
import chatRoutes from "./routes/routesChat";
type socketUsers = {
  userId: string;
  socketId: string;
};

dotenv.config();
mongoConnect();

const server = express();

var corsOptions = {
  origin: "*",
};

const serverHttp = http.createServer(server);

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

const io = new Server(serverHttp, { cors: { origin: "*" } });

export let users: socketUsers[] = [];

const addUser = (userId: string, socketId: string) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (socketId: string) => {
  users = users.filter((user) => user.socketId === socketId);
};

io.on("connection", (socket) => {
  console.log(`Usuário conectado no socket: ${socket.id}`);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("disconnect", () => {
    console.info(`Usuário saiu: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

serverHttp.listen(process.env.PORT || 80, () => {
  console.log(`Porta: ${process.env.PORT}`);
});

export { io };
