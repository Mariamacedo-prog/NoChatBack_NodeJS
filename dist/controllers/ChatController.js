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
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const Chat_1 = __importDefault(require("../models/Chat"));
const uuid_1 = require("uuid");
const server_1 = require("../server");
const app_1 = __importDefault(require("firebase/compat/app"));
require("firebase/compat/firestore");
require("firebase/compat/auth");
const firestore_1 = require("firebase/firestore");
dotenv_1.default.config();
const firebaseApp = app_1.default.initializeApp({
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
});
const db = firebaseApp.firestore();
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
            // const getChat = await Chat.find({
            //   users: userId,
            // });
            const usersChat = [];
            const getChat = [];
            const results = yield db.collection('chats').get();
            results.forEach(result => {
                const data = result.data();
                console.log(data);
                for (let item of data.users) {
                    if (item === userId) {
                        getChat.push(result.data());
                    }
                }
            });
            getChat.map((chatItem) => chatItem.users.includes(currentUser._id + "")
                ? usersChat.push(chatItem)
                : false);
            // if (usersChat.length == 0) {
            //   const newChat = await Chat.create({
            //     users: [user._id + "", currentUser._id + ""],
            //     chatId: uuidv4(),
            //   });
            //   res.json(newChat);
            //   return;
            // }
            if (usersChat.length == 0) {
                let chatIdNumber = (0, uuid_1.v4)();
                // const newChat = await db.collection('chats').add({
                //   users: [user._id + "", currentUser._id + ""],
                //   messages: [],
                //   chatId: uuidv4(),
                // });
                const newChat = yield (0, firestore_1.setDoc)((0, firestore_1.doc)(db, "chats", chatIdNumber), {
                    users: [user._id + "", currentUser._id + ""],
                    messages: [],
                    chatId: chatIdNumber,
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
            let userChat = "";
            const getChat = [];
            const results = yield db.collection('chats').get();
            results.forEach(result => {
                const data = result.data();
                console.log(data);
                for (let item of data.users) {
                    if (item === userId) {
                        getChat.push(result.data());
                    }
                }
            });
            getChat.map((chatItem) => chatItem.users.includes(currentUser._id + "")
                ? userChat = chatItem.chatId
                : false);
            // const getChat = await Chat.find({
            //   users: userId,
            // });
            // getChat.map((chatItem) =>
            //   chatItem.users.includes(currentUser._id + "")
            //     ? usersChat.push(chatItem.chatId)
            //     : false
            // );
            let date = new Date();
            const newMessage = {
                author: currentUser._id + "",
                msg,
                date,
                type,
                id: (0, uuid_1.v4)(),
                to: user._id + "",
            };
            if (userChat.length > 0) {
                yield db.collection('chats')
                    .doc(userChat)
                    .update({
                    messages: app_1.default.firestore.FieldValue.arrayUnion(newMessage),
                });
                const findChatUser = user.chats.some((value) => value.chatId == userChat);
                if (findChatUser) {
                    yield User_1.default.updateOne({ _id: user._id, "chats.chatId": userChat }, {
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
                                chatId: userChat,
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
                const findChatCurrent = currentUser.chats.some((value) => value.chatId == userChat);
                if (findChatCurrent) {
                    yield User_1.default.updateOne({ _id: currentUser._id, "chats.chatId": userChat }, {
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
                                chatId: userChat,
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
            const chat = yield db.collection('chats').doc(req.body.id).get();
            //const chat: ChatType = await Chat.findOne({ chatId: req.body.id });
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