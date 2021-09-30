import { Request, Response, Router } from "express";
import AuthValidator from "../validators/AuthValidator";
import UserValidator from "../validators/UserValidator";
import PubliValidator from "../validators/PubliValidator";
import Auth from "../middlewares/Auth";
import multer from "multer";
import upload from "../config/multer";
import PubliController from "../controllers/PubliController";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ pong: true });
});
//AUTH ROUTES
router.post("/signin", AuthValidator.signin, AuthController.signin);
router.post("/signup", AuthValidator.signup, AuthController.signup);
//USERS ROUTES
router.get("/user/me", Auth.private, UserController.userInfo);
router.put(
  "/user/me",
  multer(upload).single("avatar"),
  UserValidator.editUserInfo,
  Auth.private,

  UserController.editUserInfo
);
router.delete("/user/:id", UserController.deleteAction);
router.get("/user/:id", Auth.private, UserController.listOneUser);
router.get("/users", Auth.private, UserController.listAllUsers);
//PUBLICATIONS ROUTES
router.get("/publications", Auth.private, PubliController.findAllPublications);
router.post(
  "/publication",
  multer(upload).single("image"),
  PubliValidator.createAction,
  Auth.private,
  PubliController.createAction
);
router.put(
  "/publication/edit/:id",
  PubliValidator.editAction,
  Auth.private,
  PubliController.editAction
);
router.delete(
  "/publication/delete/:id",
  Auth.private,
  PubliController.deleteAction
);
router.get("/publication/:id", Auth.private, PubliController.findPublication);

router.put("/follow/:id", Auth.private, UserController.followUser);
router.put("/unfollow/:id", Auth.private, UserController.unfollowUser);
router.put("/like/:id", Auth.private, UserController.likePost);
router.put("/comment", Auth.private, PubliController.createCommentAction);
router.put("/comment/:id", Auth.private, PubliController.deleteCommentAction);
export default router;
