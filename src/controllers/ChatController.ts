import dotenv from "dotenv";
import { Request, Response } from "express";
import User, { UserType } from "../models/User";
import mongoose from "mongoose";
import Chat, { ChatType, ChatUserType } from "../models/Chat";
import { v4 as uuidv4 } from "uuid";
import { io, users } from "../server";
import { MessageType } from '../models/Chat';

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import 'firebase/compat/auth';
import { doc, setDoc } from "firebase/firestore"; 

dotenv.config();
const firebaseApp = firebase.initializeApp(
  {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
  }
);
const db = firebaseApp.firestore();

type UserData = {
  username?: string;
  avatar?: string;
};

export default {
  createAction: async (req: Request, res: Response) => {
    const { token, userId } = req.body;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const currentUser: UserType = await User.findOne({ token });
      const user: UserType = await User.findOne({ _id: userId });
      if (!user) {
        res.json({ error: "Usuário não encontrado" });
        return;
      }

      // const getChat = await Chat.find({
      //   users: userId,
      // });

      const usersChat: ChatType[] = [];

      const getChat: any[] = [];
 
      const results = await db.collection('chats').get();
      results.forEach(result => {
        const data = result.data();
        console.log(data);
        for(let item of data.users){
          if(item === userId){
            getChat.push(result.data())
          }
        }
      });

      getChat.map((chatItem) =>
        chatItem.users.includes(currentUser._id + "")
          ? usersChat.push(chatItem)
          : false
      );
 
      // if (usersChat.length == 0) {
      //   const newChat = await Chat.create({
      //     users: [user._id + "", currentUser._id + ""],
      //     chatId: uuidv4(),
      //   });

      //   res.json(newChat);
      //   return;
      // }

      if (usersChat.length == 0) {
        let chatIdNumber = uuidv4();
        // const newChat = await db.collection('chats').add({
        //   users: [user._id + "", currentUser._id + ""],
        //   messages: [],
        //   chatId: uuidv4(),
        // });

        const newChat = await setDoc(doc(db, "chats", chatIdNumber), {
          users: [user._id + "", currentUser._id + ""],
          messages: [],
          chatId: chatIdNumber,
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
      const currentUser: UserType = await User.findOne({ token });
      const user: UserType = await User.findOne({ _id: userId });
      if (!user) {
        res.json({ error: "Usuário não encontrado" });
        return;
      }

      let userChat: string = "";

      const getChat: any[] = [];
 
      const results = await db.collection('chats').get();
      results.forEach(result => {
        const data = result.data();
        console.log(data);
        for(let item of data.users){
          if(item === userId){
            getChat.push(result.data())
          }
        }
      });

      getChat.map((chatItem) =>
      chatItem.users.includes(currentUser._id + "")
        ? userChat = chatItem.chatId
        : false
      );

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
        id: uuidv4(),
        to: user._id + "",
      };
      
      if (userChat.length > 0) {
        await db.collection('chats')
        .doc(userChat)
        .update({
          messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
        });

        const findChatUser = user.chats.some(
          (value: ChatUserType) => value.chatId == userChat
        );

        if (findChatUser) {
          await User.updateOne(
            { _id: user._id, "chats.chatId": userChat },
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
                  chatId: userChat,
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
          (value: ChatUserType) => value.chatId == userChat
        );

        if (findChatCurrent) {
          await User.updateOne(
            { _id: currentUser._id, "chats.chatId": userChat },
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
                  chatId: userChat,
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
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const currentUser: UserType = await User.findOne({ token: req.body.token });
      const chat: any = await db.collection('chats').doc(req.body.id).get();
      //const chat: ChatType = await Chat.findOne({ chatId: req.body.id });
      if (!chat) {
        res.status(404).json({ error: "Chat não encontrado!" });
        return;
      }

      if(!currentUser){
        res.status(404).json({ error: "Não encontrado!" });
        return;
      }
    
      if (!chat.users.includes(currentUser._id + "")) {
        res.status(400).json({ error: "Chat não disponível para este Usuário!" });
        return;
      }

      res.json(chat);
    }
  },
};
