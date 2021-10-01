import { Router } from "express";
import asyncHandler from "express-async-handler";
import Auth from "../middlewares/Auth";
import ChatController from "../controllers/ChatController";

const router = Router();

router.post(
  "/direct/newchat",
  Auth.private,
  asyncHandler(ChatController.createAction)
);
router.put(
  "/direct/chat",
  Auth.private,
  asyncHandler(ChatController.sendMessageAction)
);
router.put(
  "/direct/:id",
  Auth.private,
  asyncHandler(ChatController.deleteMessageAction)
);
router.get(
  "/direct/nc/:id",
  Auth.private,
  asyncHandler(ChatController.getChatAction)
);
export default router;
