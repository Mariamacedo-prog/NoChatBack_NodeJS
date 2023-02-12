"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserValidator_1 = __importDefault(require("../validators/UserValidator"));
const AuthValidator_1 = __importDefault(require("../validators/AuthValidator"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Auth_1 = __importDefault(require("../middlewares/Auth"));
const multer_1 = __importDefault(require("multer"));
const multer_2 = __importDefault(require("../config/multer"));
const router = (0, express_1.Router)();
//AUTH ROUTES
router.post("/signin", AuthValidator_1.default.signin, (0, express_async_handler_1.default)(AuthController_1.default.signin));
router.post("/signup", AuthValidator_1.default.signup, (0, express_async_handler_1.default)(AuthController_1.default.signup));
//USERS ROUTES
router.get("/users", Auth_1.default.private, UserController_1.default.listAllUsers);
router.post("/user/one", Auth_1.default.private, (0, express_async_handler_1.default)(UserController_1.default.listOneUser));
router.get("/user/me", Auth_1.default.private, (0, express_async_handler_1.default)(UserController_1.default.userInfo));
router.put("/user/me", (0, multer_1.default)(multer_2.default).single("avatar"), UserValidator_1.default.editUserInfo, Auth_1.default.private, (0, express_async_handler_1.default)(UserController_1.default.editUserInfo));
router.delete("/user/:id", (0, express_async_handler_1.default)(UserController_1.default.deleteAction));
router.put("/follow/:id", Auth_1.default.private, (0, express_async_handler_1.default)(UserController_1.default.followUser));
router.put("/unfollow/:id", Auth_1.default.private, (0, express_async_handler_1.default)(UserController_1.default.unfollowUser));
router.put("/like/:id", Auth_1.default.private, (0, express_async_handler_1.default)(UserController_1.default.likePost));
exports.default = router;
//# sourceMappingURL=routes.js.map