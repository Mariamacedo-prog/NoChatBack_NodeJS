import { Request, Response, Router } from "express";
import User from "../models/User";

const router = Router();

router.get("/ping", async (req: Request, res: Response) => {
  const newUser = await User.create({
    email: "teste2@gmail.com",
    passwordHash: "kilson666",
    token: "kilson666",
    name: "Maria Macedo",
  });
  console.log("Novo usario", newUser);
  res.json({ pong: true });
});

export default router;
