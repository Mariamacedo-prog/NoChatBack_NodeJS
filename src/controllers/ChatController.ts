import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";
import Chat from "../models/Chat";
import { v4 as uuidv4 } from "uuid";

/*
User 
chats: [
    { chatId,
    avatar,
    lastMessage
    lastMessageDate
    title (nome da pessoa)
    with (id da pessao)
}
];

Chat
_id,
messages: [
    { author,
      msg,
      date,
      type,
    }
]
users: [userID1, userID2]
 */

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

      const verifyChat = await Chat.findOne({
        users: userId && currentUser._id + "",
      });
      if (verifyChat) {
        res.json({ chat: verifyChat });
        return;
      }

      const newChat = await Chat.create({
        users: [currentUser._id + "", userId],
      });

      res.json({ chat: newChat });
    } else {
      res.status(404).json({ error: "Usuario não encontrado" });
    }
  },
  sendMessage: async (req: Request, res: Response) => {},
};
