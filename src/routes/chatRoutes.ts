import { Request, Response, Router } from "express";
import AuthValidator from "../validators/AuthValidator";
import UserValidator from "../validators/UserValidator";
import PubliValidator from "../validators/PubliValidator";
import Auth from "../middlewares/Auth";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";
import PubliController from "../controllers/PubliController";

const router = Router();

export default router;
