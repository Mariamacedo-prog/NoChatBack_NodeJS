import { Request, Response, Router } from "express";
import AuthValidator from "../validators/AuthValidator";
import UserValidator from "../validators/UserValidator";
import PubliValidator from "../validators/PubliValidator";
import Auth from "../middlewares/Auth";
import multer from "multer";
import upload from "../config/multer";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";
import PubliController from "../controllers/PubliController";

const router = Router();

//AUTH ROUTES
router.post("/singin", AuthValidator.singin, AuthController.singin);
router.post("/singup", AuthValidator.singup, AuthController.singup);
//USERS ROUTES
router.get("/user/me", Auth.private, UserController.userInfo);
router.put(
  "/user/me",
  multer(upload).single("avatar"),
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
  multer(upload).single("image"),
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
