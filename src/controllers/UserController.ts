import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import bcrypt from "bcrypt";
import User, { UserType } from "../models/User";

export default {
  userInfo: async (req: Request, res: Response) => {
    let token = req.query.token as string;

    const user = await User.findOne({ token });

    res.json(user);
  },
};
