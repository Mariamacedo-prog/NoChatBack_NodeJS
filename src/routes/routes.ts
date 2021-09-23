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
router.put(
  "/user/me",
  upload.single("avatar"),
  Auth.private,
  UserValidator.editUserInfo,
  UserController.editUserInfo
);
router.delete("/user/:id", UserController.deleteAction);
router.get("/user/:id", Auth.private, UserController.listOneUser);
router.get("/users", Auth.private, UserController.listAllUsers);
//PUBLICATIONS ROUTES
router.post(
  "/publication",
  upload.single("image"),
  Auth.private,
  PubliValidator.createAction,
  PubliController.createAction
);
router.put(
  "/publication/:id",
  Auth.private,
  PubliValidator.editAction,
  PubliController.editAction
);
router.get("/publication/:id", Auth.private, PubliController.findPublication);
router.delete("/publication/:id", PubliController.deleteAction);
router.get("/publications", Auth.private, PubliController.findAllPublications);

router.put("/follow/:id", Auth.private, UserController.followUser);
router.put("/unfollow/:id", Auth.private, UserController.unfollowUser);
router.put("/comment", Auth.private, PubliController.createCommentAction);
router.put("/comment/:id", Auth.private, PubliController.deleteCommentAction);
export default router;
