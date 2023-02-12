"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
exports.default = {
    signin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: errors.mapped() });
            return;
        }
        const data = (0, express_validator_1.matchedData)(req);
        let user = yield User_1.default.findOne({ email: data.email }).exec();
        if (!user) {
            res.status(400).json({ error: "E-mail e/ou senha invalido!" });
            return;
        }
        const match = yield bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!match) {
            res.status(400).json({ error: "E-mail e/ou senha invalido!" });
            return;
        }
        const payload = (Date.now() + Math.random()).toString();
        const token = yield bcrypt_1.default.hash(payload, 10);
        user.token = token;
        yield user.save();
        res.json({ token, email: data.email });
    }),
    signup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: errors.mapped() });
            return;
        }
        const data = (0, express_validator_1.matchedData)(req);
        const userEmail = yield User_1.default.findOne({ email: data.email }).exec();
        if (userEmail) {
            res.status(400).json({ error: "E-mail já existe!" });
            return;
        }
        const username = data.name.split(" ").join("_").toLowerCase();
        const searchName = yield User_1.default.findOne({ name: username }).exec();
        if (searchName) {
            res.status(400).json({ error: "Username já existe!" });
            return;
        }
        const passwordHash = yield bcrypt_1.default.hash(data.password, 10);
        const payload = (Date.now() + Math.random()).toString();
        const token = yield bcrypt_1.default.hash(payload, 10);
        const newUser = new User_1.default({
            name: username,
            email: data.email,
            passwordHash,
            token,
        });
        yield newUser.save();
        res.status(201).json({ token });
    }),
};
//# sourceMappingURL=AuthController.js.map