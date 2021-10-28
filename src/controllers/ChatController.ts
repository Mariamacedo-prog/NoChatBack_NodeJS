import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";
import Chat, { ChatType, ChatUserType } from "../models/Chat";
import { v4 as uuidv4 } from "uuid";
import { io, users } from "../server";

interface MessageType {
  author: string;
  msg: string;
  date: Date;
  type: string;
  id: string;
}

type UserData = {
  username?: string;
  avatar?: string;
};

export default {
  createAction: async (req: Request, res: Response) => {
    const { token, userId } = req.body;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const currentUser = await User.findOne({ token });
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.json({ error: "Usuário não encontrado" });
        return;
      }

      const usersChat: ChatType[] = [];

      const getChat = await Chat.find({
        users: userId,
      });

      getChat.map((chatItem) =>
        chatItem.users.includes(currentUser._id + "")
          ? usersChat.push(chatItem)
          : false
      );

      if (usersChat.length == 0) {
        const newChat = await Chat.create({
          users: [user._id + "", currentUser._id + ""],
          chatId: uuidv4(),
        });

        res.json(newChat);
        return;
      }

      let userInfo: UserData = { username: user.name };

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
  },
  sendMessageAction: async (req: Request, res: Response) => {
    const { token, userId, type, msg } = req.body;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const currentUser = await User.findOne({ token });
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.json({ error: "Usuário não encontrado" });
        return;
      }

      const usersChat: string[] = [];
      const getChat = await Chat.find({
        users: userId,
      });

      getChat.map((chatItem) =>
        chatItem.users.includes(currentUser._id + "")
          ? usersChat.push(chatItem.chatId)
          : false
      );

      let date = new Date();

      const newMessage = {
        author: currentUser._id + "",
        msg,
        date,
        type,
        id: uuidv4(),
        to: user._id + "",
      };

      if (usersChat.length > 0) {
        await Chat.updateOne(
          { chatId: usersChat[0] },
          {
            $push: {
              messages: newMessage,
            },
          }
        );

        const findChatUser = user.chats.some(
          (value: ChatUserType) => value.chatId == usersChat[0]
        );

        if (findChatUser) {
          await User.updateOne(
            { _id: user._id, "chats.chatId": usersChat[0] },
            {
              $set: {
                "chats.$.avatar": currentUser.avatar
                  ? currentUser.avatar
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLuox6vatPBS6w8edvrLbqXzHimyKXOVejMQ&usqp=CAU",
                "chats.$.lastMessage": msg,
                "chats.$.lastMessageDate": date,
                "chats.$.title": currentUser.name,
              },
            },
            { upsert: true }
          );
        } else {
          await User.updateOne(
            { _id: user._id },
            {
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
                  id: uuidv4(),
                },
              },
            }
          );
        }

        const findChatCurrent = currentUser.chats.some(
          (value: ChatUserType) => value.chatId == usersChat[0]
        );

        if (findChatCurrent) {
          await User.updateOne(
            { _id: currentUser._id, "chats.chatId": usersChat[0] },
            {
              $set: {
                "chats.$.avatar": user.avatar
                  ? user.avatar
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLuox6vatPBS6w8edvrLbqXzHimyKXOVejMQ&usqp=CAU",
                "chats.$.lastMessage": msg,
                "chats.$.lastMessageDate": date,
                "chats.$.title": user.name,
              },
            },
            { upsert: true }
          );
        } else {
          await User.updateOne(
            { _id: currentUser._id },
            {
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
                  id: uuidv4(),
                },
              },
            }
          );
        }

        io.emit("getMessage", newMessage);

        res.json({});
        return;
      }
    } else {
      res.json({ error: "Não foi possível encaminhar a mensagem" });
    }
  },
  deleteMessageAction: async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUser = await User.findOne({ token: req.body.token });

    const findChat = await Chat.findOne({
      "messages.id": id,
    });

    if (!findChat) {
      res.status(404).json({ error: "Mensagem não encontrada!" });
      return;
    }

    const message: string[] = [];
    findChat.messages.map((msg: MessageType) =>
      msg.id == id ? message.push(msg.author) : false
    );

    if (message[0] == currentUser._id + "") {
      await Chat.updateOne(
        {
          _id: findChat._id,
          "messages.id": id,
        },
        {
          $set: {
            "messages.$.msg": "Esta mensagem foi apagada!",
            "messages.$.type": "deleted",
          },
        }
      );

      res.json({});
    } else {
      res.status(404).json({ error: "Você não pode apagar essa mensagem!" });
    }
  },
  getChatAction: async (req: Request, res: Response) => {
    const currentUser = await User.findOne({ token: req.body.token });
    const chat = await Chat.findOne({ chatId: req.body.id });
    if (!chat) {
      res.status(404).json({ error: "Chat não encontrado!" });
      return;
    }

    if (!chat.users.includes(currentUser._id + "")) {
      res.status(400).json({ error: "Chat não disponível para este Usuário!" });
      return;
    }

    res.json(chat);
  },
};
