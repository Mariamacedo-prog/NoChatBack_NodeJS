import { Request, Response, Router } from "express";
import AuthValidator from "../validators/AuthValidator";
import Auth from "../middlewares/Auth";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});
router.post("/singin", AuthValidator.singin, AuthController.singin);
router.post("/singup", AuthValidator.singup, AuthController.singup);
//Rotas privadas
router.get("/user/me", Auth.private, UserController.userInfo);
export default router;
