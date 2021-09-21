import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";
import Chat from "../models/Chat";
import { v4 as uuidv4 } from "uuid";

type ChatType = {
  chatId: string;
  avatar: string;
  title: string;
  with: string;
  lastMessage: string;
  lastMessageDate: Date;
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

      let usersChat: any[] = [];

      const getChat = await Chat.find({
        users: userId,
      });

      getChat.map((i) =>
        i.users.includes(currentUser._id + "") ? usersChat.push(i) : false
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
  sendMessage: async (req: Request, res: Response) => {},
};
