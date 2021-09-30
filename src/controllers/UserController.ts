import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { promises } from "fs";
import User from "../models/User";
import Publication from "../models/Publication";

dotenv.config();

export default {
  userInfo: async (req: Request, res: Response) => {
    let token = req.query.token as string;
    const user = await User.findOne({ token });

    if (!user) {
      res.json({ error: "Usuario invalido!" });
      return;
    }

    const { passwordHash, ...other } = user._doc;

    const publication = await Publication.find({ userId: user._id });

    other.publications = publication;

    res.json(other);
  },
  editUserInfo: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() });
      return;
    }
    const data = matchedData(req);

    const userUpdate = await User.findOne({ token: data.token });

    if (data.email) {
      const checkEmail = await User.findOne({ email: data.email });
      if (checkEmail) {
        res.status(400).json({ error: "E-mail já existe" });
        return;
      }

      userUpdate.email = data.email;
    }

    if (data.name) {
      const userName = data.name.split(" ").join("_").toLowerCase();

      const checkUserName = await User.findOne({ name: userName });
      if (checkUserName) {
        res.status(400).json({ error: "Username já existe" });
        return;
      }

      userUpdate.name = userName;
    }

    if (data.password) {
      userUpdate.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.description) {
      userUpdate.description = data.description;
    }

    if (req.file) {
      const fileKey: any = req.file;

      userUpdate.avatar = `${fileKey.location}`;
    }

    await userUpdate.save();

    res.json(userUpdate);
  },
  deleteAction: async (req: Request, res: Response) => {
    let id = req.params.id;

    if (mongoose.Types.ObjectId.isValid(id)) {
      await User.findOneAndDelete({ _id: id });
      res.json({});
      return;
    }

    res.status(404).json({ error: "Usuario não encontrado" });
  },
  listOneUser: async (req: Request, res: Response) => {
    let id = req.params.id;
    const user = await User.findOne({ _id: id });

    if (!user) {
      res.json({ error: "Usuario invalido!" });
      return;
    }

    const { passwordHash, token, ...other } = user._doc;

    const publication = await Publication.find({ userId: user._id });

    other.publications = publication;

    res.json(other);
  },
  listAllUsers: async (req: Request, res: Response) => {
    let { offset = 0, limit = 15, q } = req.query;
    let total = 0;

    let filters: any = {};

    if (q) {
      filters.name = { $regex: q, $options: "i" };
    }

    const usersTotal = await User.find(filters).exec();
    total = usersTotal.length;

    const users = await User.find(filters)
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .exec();

    res.json({ users, total });
  },
  followUser: async (req: Request, res: Response) => {
    const currentUser = await User.findOne({ token: req.body.token });
    const user = await User.findOne({ _id: req.params.id });

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      if (!user) {
        res.status(404).json({ error: "Usuario não existe!" });
        return;
      }

      if (currentUser._id == req.params.id) {
        res.status(403).json({ error: "Você não pode seguir você mesmo!" });
        return;
      }

      if (!user.followers.includes(currentUser._id)) {
        await currentUser.updateOne({ $push: { followings: user._id + "" } });
        await user.updateOne({ $push: { followers: currentUser._id + "" } });
        res.json({});
        return;
      }

      res.status(403).json({ error: "Você já segue este usuario!" });
      return;
    }

    res.status(404).json({ error: "Usuario não encontrado!" });
  },
  unfollowUser: async (req: Request, res: Response) => {
    const currentUser = await User.findOne({ token: req.body.token });
    const user = await User.findOne({ _id: req.params.id });

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      if (!user) {
        res.status(404).json({ error: "Usuario não existe!" });
        return;
      }

      if (currentUser._id == req.params.id) {
        res.status(403).json({ error: "Você não pode seguir você mesmo!" });
        return;
      }

      if (user.followers.includes(currentUser._id)) {
        await currentUser.updateOne({ $pull: { followings: user._id + "" } });
        await user.updateOne({ $pull: { followers: currentUser._id + "" } });
        res.json({});
        return;
      }
      res.status(403).json({ error: "Você não segue este usuario!" });
      return;
    }
    res.status(404).json({ error: "Usuario não encontrado!" });
  },
  likePost: async (req: Request, res: Response) => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const user = await User.findOne({ token: req.body.token });
      const publication = await Publication.findOne({ _id: req.params.id });

      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada!" });
        return;
      }
      if (!publication.like.includes(user._id)) {
        await publication.updateOne({ $push: { like: user._id + "" } });
      } else {
        await publication.updateOne({ $pull: { like: user._id + "" } });
      }

      res.json({});
      return;
    }

    res.json({ error: "Publicação não encontrada" });
  },
};
