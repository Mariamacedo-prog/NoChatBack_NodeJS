import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/User";

export default {
  signin: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.mapped() });
      return;
    }
    const data = matchedData(req);

    let user = await User.findOne({ email: data.email }).exec();
    
    if (!user) {
      res.status(400).json({ error: "E-mail e/ou senha invalido!" });
      return;
    }

    const match = await bcrypt.compare(data.password, user.passwordHash);
    if (!match) {
      res.status(400).json({ error: "E-mail e/ou senha invalido!" });
      return;
    }

    const payload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hash(payload, 10);
    user.token = token;

    await user.save();

    res.json({ token, email: data.email });
  },
  signup: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.mapped() });
      return;
    }
    const data = matchedData(req);

    const userEmail = await User.findOne({ email: data.email }).exec();
    if (userEmail) {
      res.status(400).json({ error: "E-mail já existe!" });
      return;
    }

    const username = data.name.split(" ").join("_").toLowerCase();

    const searchName = await User.findOne({ name: username }).exec();
    if (searchName) {
      res.status(400).json({ error: "Username já existe!" });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const payload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hash(payload, 10);

    const newUser = new User({
      name: username,
      email: data.email,
      passwordHash,
      token,
    });

    await newUser.save();

    res.status(201).json({ token });
  },
};
