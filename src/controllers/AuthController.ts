import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/User";

export default {
  singin: (req: Request, res: Response) => {},
  singup: async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() });
      return;
    }
    const data = matchedData(req);

    const user = await User.findOne({ email: data.email });

    if (user) {
      res.json({
        error: { email: { msg: "E-mail já existe!" } },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const payload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hash(payload, 10);

    console.log(token);

    const newUser = new User({
      name: data.name,
      email: data.email,
      passwordHash,
      token,
    });
    await newUser.save();

    res.json({ token });
  },
};
