"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    token: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: String,
    avatar: String,
    followings: [],
    followers: [],
    chats: [],
}, { timestamps: true });
const modelName = "User";
exports.default = (0, mongoose_1.model)(modelName, schema);
//# sourceMappingURL=User.js.map