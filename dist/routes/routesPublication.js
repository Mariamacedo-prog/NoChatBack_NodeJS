"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Auth_1 = __importDefault(require("../middlewares/Auth"));
const multer_1 = __importDefault(require("multer"));
const multer_2 = __importDefault(require("../config/multer"));
const PubliValidator_1 = __importDefault(require("../validators/PubliValidator"));
const PubliController_1 = __importDefault(require("../controllers/PubliController"));
const router = (0, express_1.Router)();
//PUBLICATIONS ROUTES
router.get("/publications", Auth_1.default.private, (0, express_async_handler_1.default)(PubliController_1.default.findAllPublications));
router.post("/publication", (0, multer_1.default)(multer_2.default).single("image"), PubliValidator_1.default.createAction, Auth_1.default.private, (0, express_async_handler_1.default)(PubliController_1.default.createAction));
router.put("/publication/edit/:id", PubliValidator_1.default.editAction, Auth_1.default.private, (0, express_async_handler_1.default)(PubliController_1.default.editAction));
router.delete("/publication/delete/:id", Auth_1.default.private, (0, express_async_handler_1.default)(PubliController_1.default.deleteAction));
router.post("/publication/one", Auth_1.default.private, (0, express_async_handler_1.default)(PubliController_1.default.findPublication));
router.put("/comment", Auth_1.default.private, (0, express_async_handler_1.default)(PubliController_1.default.createCommentAction));
router.put("/comment/:id", Auth_1.default.private, (0, express_async_handler_1.default)(PubliController_1.default.deleteCommentAction));
exports.default = router;
//# sourceMappingURL=routesPublication.js.map