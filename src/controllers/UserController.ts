import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User, {UserType} from "../models/User";
import Publication from "../models/Publication";

dotenv.config();

interface FileData extends Express.Multer.File {
  location?: string;
}

export default {
  userInfo: async (req: Request, res: Response) => {
    let token = req.query.token as string;
    const user: UserType = await User.findOne({ token }).exec();

    if (!user) {
      res.json({ error: "Usuário invalido!" });
      return;
    }

    const { passwordHash, ...other } = user._doc;

    res.json(other);
  },
  editUserInfo: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.mapped() });
      return;
    }
    const data = matchedData(req);

    const userUpdate = await User.findOne({ token: data.token }).exec();

    if (data.email && data.email != userUpdate.email) {
      const checkEmail = await User.findOne({ email: data.email }).exec();
      if (checkEmail) {
        res.status(400).json({ error: "E-mail já existe" });
        return;
      }

      userUpdate.email = data.email;
    }

    if (data.name) {
      const userName = data.name.split(" ").join("_").toLowerCase();
      if (userName !== userUpdate.name) {
        const checkUserName = await User.findOne({ name: userName }).exec();

        if (checkUserName) {
          res.status(400).json({ error: "Username já existe" });
          return;
        }

        userUpdate.name = userName;
      }
    }

    if (data.password) {
      userUpdate.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.description) {
      userUpdate.description = data.description;
    }

    if (req.file) {
      const fileKey: FileData = req.file;

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

    res.status(404).json({ error: "Usuário não encontrado" });
  },
  listOneUser: async (req: Request, res: Response) => {
    let name = req.body.name;
    const user = await User.findOne({ name }).exec();
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado!" });
      return;
    }

    const publications = await Publication.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    const { passwordHash, token, ...other } = user._doc;

    const posts = publications.map((item) => {
      const newItem = { ...item._doc };
      newItem.username = user.name;
      if (user.avatar) {
        newItem.avatar = user.avatar;
      }

      return newItem;
    });

    res.json({ user: other, publications: posts });
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
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const currentUser: UserType = await User.findOne({ token: req.body.token });
      const user: UserType = await User.findOne({ _id: req.params.id });

      if (!user) {
        res.status(404).json({ error: "Usuário não existe!" });
        return;
      }

      if (currentUser._id == req.params.id) {
        res.status(403).json({ error: "Você não pode seguir você mesmo!" });
        return;
      }

        if (!user.followers.includes(currentUser._id + "")) {
          await currentUser.updateOne({ $push: { followings: user._id + "" } });
          await user.updateOne({ $push: { followers: currentUser._id + "" } });
          res.json({});
          return;
        }
     

      res.status(403).json({ error: "Você já segue este Usuário!" });
      return;
    }

    res.status(404).json({ error: "Usuário não encontrado!" });
  },
  unfollowUser: async (req: Request, res: Response) => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const currentUser = await User.findOne({ token: req.body.token });
      
      const user = await User.findOne({ _id: req.params.id });
      if (!user) {
        res.status(404).json({ error: "Usuário não existe!" });
        return;
      }
      
      if (currentUser._id == req.params.id) {
        res.status(403).json({ error: "Você não pode seguir você mesmo!" });
        return;
      }

      if (user.followers.includes(currentUser._id  + "")) {
        await currentUser.updateOne({ $pull: { followings: user._id + "" } });
        await user.updateOne({ $pull: { followers: currentUser._id + "" } });
        res.json({});
        return;
      }

      res.status(403).json({ error: "Você não segue este Usuário!" });
      return;
    }
    res.status(404).json({ error: "Usuário não encontrado!" });
  },
  likePost: async (req: Request, res: Response) => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const user = await User.findOne({ token: req.body.token }).exec();
      const publication = await Publication.findOne({ _id: req.params.id }).exec();

      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada!" });
        return;
      }
      if (!publication.like.includes(user._id + "")) {
        await publication.updateOne({ $push: { like: user._id + "" } });
        res.json({ liked: true });
        return;
      } else {
        await publication.updateOne({ $pull: { like: user._id + "" } });
        res.json({ liked: false });
        return;
      }       
    }

    res.status(404).json({ error: "Publicação não encontrada" });
  },
};
