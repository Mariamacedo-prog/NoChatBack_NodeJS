import { Request, Response, Router } from "express";
import Auth from "../middlewares/Auth";
import ChatController from "../controllers/ChatController";

const router = Router();

router.post("/direct/newchat", Auth.private, ChatController.createAction);
router.put("/direct/:id", Auth.private, ChatController.sendMessage);

export default router;
