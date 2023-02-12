"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.users = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = require("multer");
const mongo_1 = require("./database/mongo");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const routes_1 = __importDefault(require("./routes/routes"));
const routesPublication_1 = __importDefault(require("./routes/routesPublication"));
const routesChat_1 = __importDefault(require("./routes/routesChat"));
dotenv_1.default.config();
(0, mongo_1.mongoConnect)();
const server = (0, express_1.default)();
var corsOptions = {
    origin: "*",
};
const serverHttp = http_1.default.createServer(server);
server.use((0, cors_1.default)(corsOptions));
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: true }));
server.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
server.use(routes_1.default);
server.use(routesPublication_1.default);
server.use(routesChat_1.default);
server.use((req, res) => {
    res.status(404);
    res.json({ error: "Erro!! Página não encontrada" });
});
const errorHandler = (err, req, res, next) => {
    res.status(400);
    console.log(err);
    if (err instanceof multer_1.MulterError) {
        res.json({ error: err.code });
        return;
    }
    res.json({ error: err.message });
};
server.use(errorHandler);
const io = new socket_io_1.Server(serverHttp, { cors: { origin: "*" } });
exports.io = io;
exports.users = [];
const addUser = (userId, socketId) => {
    !exports.users.some((user) => user.userId === userId) &&
        exports.users.push({ userId, socketId });
};
const removeUser = (socketId) => {
    exports.users = exports.users.filter((user) => user.socketId === socketId);
};
io.on("connection", (socket) => {
    console.log(`Usuário conectado no socket: ${socket.id}`);
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", exports.users);
    });
    socket.on("disconnect", () => {
        console.info(`Usuário saiu: ${socket.id}`);
        removeUser(socket.id);
        io.emit("getUsers", exports.users);
    });
});
serverHttp.listen(process.env.PORT || 80, () => {
    console.log(`Porta: `);
});
//# sourceMappingURL=server.js.map