"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    messages: [],
    users: [],
    chatId: { type: String },
});
const modelName = "Chat";
exports.default = (0, mongoose_1.model)(modelName, schema);
//# sourceMappingURL=Chat.js.map