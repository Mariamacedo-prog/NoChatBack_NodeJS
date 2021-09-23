import { Request, Response, Router } from "express";
import Auth from "../middlewares/Auth";
import ChatController from "../controllers/ChatController";

const router = Router();

router.post("/direct/newchat", Auth.private, ChatController.createAction);
router.put("/direct/chat", Auth.private, ChatController.sendMessageAction);
router.put("/direct/:id", Auth.private, ChatController.deleteAction);
export default router;
