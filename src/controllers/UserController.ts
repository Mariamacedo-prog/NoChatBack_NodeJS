import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import sharp from "sharp";
import dotenv from "dotenv";
import { promises } from "fs";
import User from "../models/User";
const { unlink } = promises;

dotenv.config();

export default {
  userInfo: async (req: Request, res: Response) => {
    let token = req.query.token as string;
    const user = await User.findOne({ token });

    res.json(user);
  },
  updateUserInformation: async (req: Request, res: Response) => {
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
      userUpdate.name = data.name;
    }

    if (data.password) {
      userUpdate.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.description) {
      userUpdate.description = data.description;
    }

    if (req.file) {
      const filename = `${req.file.filename}.jpg`;
      await sharp(req.file.path)
        .resize(300, 300)
        .toFormat("jpg")
        .toFile(`./public/media/${filename}`);

      await unlink(req.file.path);

      userUpdate.avatar = `${process.env.SERVER_URL}/media/${filename}`;
    }

    await userUpdate.save();

    res.json(userUpdate);
  },
};
