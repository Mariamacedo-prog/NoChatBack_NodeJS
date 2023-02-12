"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const schema = new mongoose_1.Schema({
    category: { type: String, required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    like: [],
    comment: [],
    title: String,
    deslike: [],
    image: String,
    share: [],
}, { timestamps: true });
const modelName = "Publication";
exports.default = (0, mongoose_1.model)(modelName, schema);
//# sourceMappingURL=Publication.js.map