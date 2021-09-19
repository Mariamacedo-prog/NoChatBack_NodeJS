import { Request, Response, Router } from "express";
import AuthValidator from "../validators/AuthValidator";
import UserValidator from "../validators/UserValidator";
import PubliValidator from "../validators/PubliValidator";
import Auth from "../middlewares/Auth";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";
import PubliController from "../controllers/PubliController";
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
//AUTH ROUTES
router.post("/singin", AuthValidator.singin, AuthController.singin);
router.post("/singup", AuthValidator.singup, AuthController.singup);
//USERS ROUTES
router.get("/user/me", Auth.private, UserController.userInfo);
router.post(
  "/user/me",
  upload.single("avatar"),
  Auth.private,
  UserValidator.editUserInfo,
  UserController.editUserInfo
);
router.delete("/user/:id", UserController.deleteUser);
router.get("/user/:name", Auth.private, UserController.findOneUser);
router.get("/users", Auth.private, UserController.findAllUsers);
//PUBLICATIONS ROUTES
router.post(
  "/publication",
  upload.single("image"),
  Auth.private,
  PubliValidator.createPublication,
  PubliController.createPublication
);
router.get("/publication/:id", Auth.private, PubliController.findPublication);
router.get("/publications", Auth.private, PubliController.findAllPublications);
router.put(
  "/publication/:id",
  Auth.private,
  PubliValidator.editAction,
  PubliController.editAction
);
export default router;
