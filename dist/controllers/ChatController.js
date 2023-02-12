"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const Chat_1 = __importDefault(require("../models/Chat"));
const uuid_1 = require("uuid");
const server_1 = require("../server");
exports.default = {
    createAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { token, userId } = req.body;
        if (mongoose_1.default.Types.ObjectId.isValid(userId)) {
            const currentUser = yield User_1.default.findOne({ token });
            const user = yield User_1.default.findOne({ _id: userId });
            if (!user) {
                res.json({ error: "Usuário não encontrado" });
                return;
            }
            const usersChat = [];
            const getChat = yield Chat_1.default.find({
                users: userId,
            });
            getChat.map((chatItem) => chatItem.users.includes(currentUser._id + "")
                ? usersChat.push(chatItem)
                : false);
            if (usersChat.length == 0) {
                const newChat = yield Chat_1.default.create({
                    users: [user._id + "", currentUser._id + ""],
                    chatId: (0, uuid_1.v4)(),
                });
                res.json(newChat);
                return;
            }
            let userInfo = { username: user.name };
            if (user.avatar) {
                userInfo.avatar = user.avatar;
            }
            res.json({
                chat: usersChat[0],
                userInfo,
            });
            return;
        }
        res.json({ error: "Não foi possível localizar o Chat!" });
    }),
    sendMessageAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { token, userId, type, msg } = req.body;
        if (mongoose_1.default.Types.ObjectId.isValid(userId)) {
            const currentUser = yield User_1.default.findOne({ token });
            const user = yield User_1.default.findOne({ _id: userId });
            if (!user) {
                res.json({ error: "Usuário não encontrado" });
                return;
            }
            const usersChat = [];
            const getChat = yield Chat_1.default.find({
                users: userId,
            });
            getChat.map((chatItem) => chatItem.users.includes(currentUser._id + "")
                ? usersChat.push(chatItem.chatId)
                : false);
            let date = new Date();
            const newMessage = {
                author: currentUser._id + "",
                msg,
                date,
                type,
                id: (0, uuid_1.v4)(),
                to: user._id + "",
            };
            if (usersChat.length > 0) {
                yield Chat_1.default.updateOne({ chatId: usersChat[0] }, {
                    $push: {
                        messages: newMessage,
                    },
                });
                const findChatUser = user.chats.some((value) => value.chatId == usersChat[0]);
                if (findChatUser) {
                    yield User_1.default.updateOne({ _id: user._id, "chats.chatId": usersChat[0] }, {
                        $set: {
                            "chats.$.avatar": currentUser.avatar
                                ? currentUser.avatar
                                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLuox6vatPBS6w8edvrLbqXzHimyKXOVejMQ&usqp=CAU",
                            "chats.$.lastMessage": msg,
                            "chats.$.lastMessageDate": date,
                            "chats.$.title": currentUser.name,
                        },
                    }, { upsert: true });
                }
                else {
                    yield User_1.default.updateOne({ _id: user._id }, {
                        $push: {
                            chats: {
                                chatId: usersChat[0],
                                avatar: currentUser.avatar
                                    ? currentUser.avatar
                                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLuox6vatPBS6w8edvrLbqXzHimyKXOVejMQ&usqp=CAU",
                                lastMessage: msg,
                                lastMessageDate: date,
                                title: currentUser.name,
                                with: currentUser._id + "",
                                id: (0, uuid_1.v4)(),
                            },
                        },
                    });
                }
                const findChatCurrent = currentUser.chats.some((value) => value.chatId == usersChat[0]);
                if (findChatCurrent) {
                    yield User_1.default.updateOne({ _id: currentUser._id, "chats.chatId": usersChat[0] }, {
                        $set: {
                            "chats.$.avatar": user.avatar
                                ? user.avatar
                                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLuox6vatPBS6w8edvrLbqXzHimyKXOVejMQ&usqp=CAU",
                            "chats.$.lastMessage": msg,
                            "chats.$.lastMessageDate": date,
                            "chats.$.title": user.name,
                        },
                    }, { upsert: true });
                }
                else {
                    yield User_1.default.updateOne({ _id: currentUser._id }, {
                        $push: {
                            chats: {
                                chatId: usersChat[0],
                                avatar: user.avatar
                                    ? user.avatar
                                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLuox6vatPBS6w8edvrLbqXzHimyKXOVejMQ&usqp=CAU",
                                lastMessage: msg,
                                lastMessageDate: date,
                                title: user.name,
                                with: user._id + "",
                                id: (0, uuid_1.v4)(),
                            },
                        },
                    });
                }
                server_1.io.emit("getMessage", newMessage);
                res.json({});
                return;
            }
        }
        else {
            res.json({ error: "Não foi possível encaminhar a mensagem" });
        }
    }),
    deleteMessageAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const currentUser = yield User_1.default.findOne({ token: req.body.token });
        const findChat = yield Chat_1.default.findOne({
            "messages.id": id,
        });
        if (!findChat) {
            res.status(404).json({ error: "Mensagem não encontrada!" });
            return;
        }
        const message = [];
        findChat.messages.map((msg) => msg.id == id ? message.push(msg.author) : false);
        if (message[0] == currentUser._id + "") {
            yield Chat_1.default.updateOne({
                _id: findChat._id,
                "messages.id": id,
            }, {
                $set: {
                    "messages.$.msg": "Esta mensagem foi apagada!",
                    "messages.$.type": "deleted",
                },
            });
            res.json({});
        }
        else {
            res.status(404).json({ error: "Você não pode apagar essa mensagem!" });
        }
    }),
    getChatAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            const currentUser = yield User_1.default.findOne({ token: req.body.token });
            const chat = yield Chat_1.default.findOne({ chatId: req.body.id });
            if (!chat) {
                res.status(404).json({ error: "Chat não encontrado!" });
                return;
            }
            if (!currentUser) {
                res.status(404).json({ error: "Não encontrado!" });
                return;
            }
            if (!chat.users.includes(currentUser._id + "")) {
                res.status(400).json({ error: "Chat não disponível para este Usuário!" });
                return;
            }
            res.json(chat);
        }
    }),
};
//# sourceMappingURL=ChatController.js.map