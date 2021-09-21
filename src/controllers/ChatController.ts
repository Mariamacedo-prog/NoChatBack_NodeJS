import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";
import Chat from "../models/Chat";
import { v4 as uuidv4 } from "uuid";

type ChatUserType = {
  chatId: string;
  avatar: string;
  title: string;
  with: string;
  lastMessage: string;
  lastMessageDate: Date;
};

type ChatType = {
  _id: string;
  messages: [];
  users: [];
};

export default {
  createAction: async (req: Request, res: Response) => {
    let { token, userId } = req.body;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const currentUser = await User.findOne({ token });
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.json({ error: "Usuario não encontrado" });
        return;
      }
      if (!currentUser) {
        res.json({ error: "Usuario não encontrado" });
        return;
      }

      let usersChat: ChatType[] = [];

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
        });

        res.json({ chat: newChat });
        return;
      }

      res.json({ chat: usersChat });
      return;
    }
    res.json({ error: "Não foi possível localizar o Chat!" });
  },
  sendMessageAction: async (req: Request, res: Response) => {},
};
