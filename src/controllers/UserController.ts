import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import sharp from "sharp";
import { promises } from "fs";
import User from "../models/User";
const { unlink } = promises;

export default {
  userInfo: async (req: Request, res: Response) => {
    let token = req.query.token as string;
    const user = await User.findOne({ token });

    res.json(user);
  },
  uploadAvatar: async (req: Request, res: Response) => {
    if (req.file) {
      const filename = `${req.file.filename}.jpg`;
      await sharp(req.file.path)
        .resize(300, 300)
        .toFormat("jpg")
        .toFile(`./public/media/${filename}`);

      await unlink(req.file.path);

      res.json({ image: `${filename}` });
    } else {
      res.status(400);
      res.json({ error: "Arquivo inexistente" });
    }
  },
};
