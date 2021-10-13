import { Router } from "express";
import UserValidator from "../validators/UserValidator";
import AuthValidator from "../validators/AuthValidator";
import UserController from "../controllers/UserController";
import AuthController from "../controllers/AuthController";
import asyncHandler from "express-async-handler";
import Auth from "../middlewares/Auth";
import multer from "multer";
import upload from "../config/multer";

const router = Router();

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
router.get("/users", Auth.private, UserController.listAllUsers);
router.post(
  "/user/one",
  Auth.private,
  asyncHandler(UserController.listOneUser)
);
router.get("/user/me", Auth.private, asyncHandler(UserController.userInfo));
router.put(
  "/user/me",
  multer(upload).single("avatar"),
  UserValidator.editUserInfo,
  Auth.private,
  asyncHandler(UserController.editUserInfo)
);
router.delete("/user/:id", asyncHandler(UserController.deleteAction));
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

export default router;
