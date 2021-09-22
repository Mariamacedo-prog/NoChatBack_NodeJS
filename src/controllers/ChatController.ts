import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";
import Chat, { ChatType, ChatUserType } from "../models/Chat";
import { v4 as uuidv4 } from "uuid";

export default {
  createAction: async (req: Request, res: Response) => {
    const { token, userId } = req.body;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const currentUser = await User.findOne({ token });
      const user = await User.findOne({ _id: userId });
      if (!user) {
        res.json({ error: "Usuario não encontrado" });
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

        res.json({ chat: newChat });
        return;
      }

      res.json({ chat: usersChat });
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
        res.json({ error: "Usuario não encontrado" });
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

      if (usersChat.length > 0) {
        await Chat.updateOne(
          { chatId: usersChat[0] },
          {
            $push: {
              messages: {
                author: currentUser._id + "",
                msg,
                date,
                type,
                id: uuidv4(),
              },
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
                  : "noChat.jpg",
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
                    : "noChat.jpg",
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

        /* if (currentUser.chats.includes({ chatId: usersChat[0] })) {
          await User.updateOne(
            { _id: currentUser._id, "chats.chatId": usersChat[0] },
            {
              $set: {
                avatar: user.avatar ? user.avatar : "noChat.jpg",
                lastMessage: msg,
                lastMessageDate: date,
                title: user.name,
              },
            }
          );
        } else {
          await User.updateOne(
            { _id: currentUser._id },
            {
              $push: {
                chats: {
                  chatId: usersChat[0],
                  avatar: user.avatar ? user.avatar : "noChat.jpg",
                  lastMessage: msg,
                  lastMessageDate: date,
                  title: user.name,
                  with: user._id + "",
                  id: uuidv4(),
                },
              },
            }
          );
        }*/

        const findChatCurrent = currentUser.chats.some(
          (value: ChatUserType) => value.chatId == usersChat[0]
        );

        if (findChatCurrent) {
          await User.updateOne(
            { _id: currentUser._id, "chats.chatId": usersChat[0] },
            {
              $set: {
                "chats.$.avatar": user.avatar ? user.avatar : "noChat.jpg",
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
                  avatar: user.avatar ? user.avatar : "noChat.jpg",
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

        res.json({});
        return;
      }
    } else {
      res.json({ error: "Não foi possível encaminhar a mensagem" });
    }
  },
};
