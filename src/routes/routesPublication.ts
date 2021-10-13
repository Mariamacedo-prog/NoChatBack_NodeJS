import { Router } from "express";
import asyncHandler from "express-async-handler";
import Auth from "../middlewares/Auth";
import multer from "multer";
import upload from "../config/multer";
import PubliValidator from "../validators/PubliValidator";
import PubliController from "../controllers/PubliController";

const router = Router();

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
router.post(
  "/publication/one",
  Auth.private,
  asyncHandler(PubliController.findPublication)
);
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
