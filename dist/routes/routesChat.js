"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Auth_1 = __importDefault(require("../middlewares/Auth"));
const ChatController_1 = __importDefault(require("../controllers/ChatController"));
const router = (0, express_1.Router)();
router.post("/direct/newchat", Auth_1.default.private, (0, express_async_handler_1.default)(ChatController_1.default.createAction));
router.put("/direct/chat", Auth_1.default.private, (0, express_async_handler_1.default)(ChatController_1.default.sendMessageAction));
router.put("/direct/:id", Auth_1.default.private, (0, express_async_handler_1.default)(ChatController_1.default.deleteMessageAction));
router.post("/direct/nc", Auth_1.default.private, (0, express_async_handler_1.default)(ChatController_1.default.getChatAction));
exports.default = router;
//# sourceMappingURL=routesChat.js.map