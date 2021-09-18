import { Request, Response, Router } from "express";
import AuthValidator from "../validators/AuthValidator";
import UserValidator from "../validators/UserValidator";
import Auth from "../middlewares/Auth";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";
import multer from "multer";

const upload = multer({
  dest: "./tmp",
  fileFilter: (req, file, cd) => {
    const allowed: string[] = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    cd(null, allowed.includes(file.mimetype));
  },
  limits: { fieldSize: 20000000 },
});

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});
router.post("/singin", AuthValidator.singin, AuthController.singin);
router.post("/singup", AuthValidator.singup, AuthController.singup);
//USER ROUTES
router.get("/user/me", Auth.private, UserController.userInfo);
router.post(
  "/user/me",
  upload.single("avatar"),
  Auth.private,
  UserValidator.editUserInfo,
  UserController.editUserInfo
);
router.delete("/user/:id", UserController.deleteUser);
router.get("/user/:id", Auth.private, UserController.anotherUsers);
router.get("/users", Auth.private, UserController.findAllUsers);
//

export default router;
