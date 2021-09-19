import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import sharp from "sharp";
import dotenv from "dotenv";
import { promises } from "fs";
import User from "../models/User";
import Publication from "../models/Publication";
const { unlink } = promises;

dotenv.config();

export default {
  userInfo: async (req: Request, res: Response) => {
    let token = req.query.token as string;
    const user = await User.findOne({ token });

    if (!user) {
      res.json({ error: "Usuario invalido!" });
      return;
    }

    res.json({ user });
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
        res.json({ error: "E-mail já existe" });
        return;
      }

      userUpdate.email = data.email;
    }

    if (data.name) {
      const userNameWithoutSpace = data.name.split(" ").join("_").toLowerCase();

      const checkUserName = await User.findOne({ name: userNameWithoutSpace });
      if (checkUserName) {
        res.json({ error: "Username já existe" });
        return;
      }

      userUpdate.name = userNameWithoutSpace;
    }

    if (data.password) {
      userUpdate.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.description) {
      userUpdate.description = data.description;
    }

    if (req.file) {
      const filename = `avatar${req.file.filename}.jpg`;
      await sharp(req.file.path)
        .resize(300, 300)
        .toFormat("jpg")
        .toFile(`./public/media/${filename}`);

      await unlink(req.file.path);

      userUpdate.avatar = `${filename}`;
    }

    await userUpdate.save();

    res.json({ user: userUpdate });
  },
  deleteAction: async (req: Request, res: Response) => {
    let id = req.params.id;

    await User.findOneAndDelete({ _id: id });

    res.json({});
  },
  listOneUser: async (req: Request, res: Response) => {
    let userName = req.params.name;
    const user = await User.findOne({ name: userName });

    if (!user) {
      res.json({ error: "Usuario invalido!" });
      return;
    }

    const publication = await Publication.find({ userId: user._id });

    res.json({ user, publication });
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
};
