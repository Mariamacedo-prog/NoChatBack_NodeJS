import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
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
router.post(
  "/signin",
  AuthValidator.signin,
  asyncHandler(AuthController.signin)
);
router.post(
  "/signup",
  AuthValidator.signup,
  asyncHandler(AuthController.signup)
);
//USERS ROUTES
router.get("/user/me", Auth.private, asyncHandler(UserController.userInfo));
router.put(
  "/user/me",
  multer(upload).single("avatar"),
  UserValidator.editUserInfo,
  Auth.private,
  asyncHandler(UserController.editUserInfo)
);
router.delete("/user/:id", asyncHandler(UserController.deleteAction));
router.get("/user/:id", Auth.private, asyncHandler(UserController.listOneUser));
router.get("/users", Auth.private, UserController.listAllUsers);
//PUBLICATIONS ROUTES
router.get(
  "/publications",
  Auth.private,
  asyncHandler(PubliController.findAllPublications)
);
router.post(
  "/publication",
  multer(upload).single("image"),
  PubliValidator.createAction,
  Auth.private,
  asyncHandler(PubliController.createAction)
);
router.put(
  "/publication/edit/:id",
  PubliValidator.editAction,
  Auth.private,
  asyncHandler(PubliController.editAction)
);
router.delete(
  "/publication/delete/:id",
  Auth.private,
  asyncHandler(PubliController.deleteAction)
);
router.get(
  "/publication/:id",
  Auth.private,
  asyncHandler(PubliController.findPublication)
);

router.put(
  "/follow/:id",
  Auth.private,
  asyncHandler(UserController.followUser)
);
router.put(
  "/unfollow/:id",
  Auth.private,
  asyncHandler(UserController.unfollowUser)
);
router.put("/like/:id", Auth.private, asyncHandler(UserController.likePost));
router.put(
  "/comment",
  Auth.private,
  asyncHandler(PubliController.createCommentAction)
);
router.put(
  "/comment/:id",
  Auth.private,
  asyncHandler(PubliController.deleteCommentAction)
);
export default router;
