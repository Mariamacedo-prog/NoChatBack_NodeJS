import { Request, Response, Router } from "express";
import AuthValidator from "../validators/AuthValidator";
import AuthController from "../controllers/AuthController";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});

router.post("/singup", AuthValidator.singup, AuthController.singup);

export default router;
