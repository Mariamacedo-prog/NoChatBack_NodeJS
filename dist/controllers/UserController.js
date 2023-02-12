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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Publication_1 = __importDefault(require("../models/Publication"));
dotenv_1.default.config();
exports.default = {
    userInfo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let token = req.query.token;
        const user = yield User_1.default.findOne({ token }).exec();
        if (!user) {
            res.json({ error: "Usuário invalido!" });
            return;
        }
        const _a = user._doc, { passwordHash } = _a, other = __rest(_a, ["passwordHash"]);
        res.json(other);
    }),
    editUserInfo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: errors.mapped() });
            return;
        }
        const data = (0, express_validator_1.matchedData)(req);
        const userUpdate = yield User_1.default.findOne({ token: data.token }).exec();
        if (data.email && data.email != userUpdate.email) {
            const checkEmail = yield User_1.default.findOne({ email: data.email }).exec();
            if (checkEmail) {
                res.status(400).json({ error: "E-mail já existe" });
                return;
            }
            userUpdate.email = data.email;
        }
        if (data.name) {
            const userName = data.name.split(" ").join("_").toLowerCase();
            if (userName !== userUpdate.name) {
                const checkUserName = yield User_1.default.findOne({ name: userName }).exec();
                if (checkUserName) {
                    res.status(400).json({ error: "Username já existe" });
                    return;
                }
                userUpdate.name = userName;
            }
        }
        if (data.password) {
            userUpdate.passwordHash = yield bcrypt_1.default.hash(data.password, 10);
        }
        if (data.description) {
            userUpdate.description = data.description;
        }
        if (req.file) {
            const fileKey = req.file;
            userUpdate.avatar = `${fileKey.location}`;
        }
        yield userUpdate.save();
        res.json(userUpdate);
    }),
    deleteAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let id = req.params.id;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            yield User_1.default.findOneAndDelete({ _id: id });
            res.json({});
            return;
        }
        res.status(404).json({ error: "Usuário não encontrado" });
    }),
    listOneUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let name = req.body.name;
        const user = yield User_1.default.findOne({ name }).exec();
        if (!user) {
            res.status(404).json({ error: "Usuário não encontrado!" });
            return;
        }
        const publications = yield Publication_1.default.find({ userId: user._id }).sort({
            createdAt: -1,
        });
        const _b = user._doc, { passwordHash, token } = _b, other = __rest(_b, ["passwordHash", "token"]);
        const posts = publications.map((item) => {
            const newItem = Object.assign({}, item._doc);
            newItem.username = user.name;
            if (user.avatar) {
                newItem.avatar = user.avatar;
            }
            return newItem;
        });
        res.json({ user: other, publications: posts });
    }),
    listAllUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { offset = 0, limit = 15, q } = req.query;
        let total = 0;
        let filters = {};
        if (q) {
            filters.name = { $regex: q, $options: "i" };
        }
        const usersTotal = yield User_1.default.find(filters).exec();
        total = usersTotal.length;
        const users = yield User_1.default.find(filters)
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec();
        res.json({ users, total });
    }),
    followUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            const currentUser = yield User_1.default.findOne({ token: req.body.token });
            const user = yield User_1.default.findOne({ _id: req.params.id });
            if (!user) {
                res.status(404).json({ error: "Usuário não existe!" });
                return;
            }
            if (currentUser._id == req.params.id) {
                res.status(403).json({ error: "Você não pode seguir você mesmo!" });
                return;
            }
            if (!user.followers.includes(currentUser._id + "")) {
                yield currentUser.updateOne({ $push: { followings: user._id + "" } });
                yield user.updateOne({ $push: { followers: currentUser._id + "" } });
                res.json({});
                return;
            }
            res.status(403).json({ error: "Você já segue este Usuário!" });
            return;
        }
        res.status(404).json({ error: "Usuário não encontrado!" });
    }),
    unfollowUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            const currentUser = yield User_1.default.findOne({ token: req.body.token });
            const user = yield User_1.default.findOne({ _id: req.params.id });
            if (!user) {
                res.status(404).json({ error: "Usuário não existe!" });
                return;
            }
            if (currentUser._id == req.params.id) {
                res.status(403).json({ error: "Você não pode seguir você mesmo!" });
                return;
            }
            if (user.followers.includes(currentUser._id + "")) {
                yield currentUser.updateOne({ $pull: { followings: user._id + "" } });
                yield user.updateOne({ $pull: { followers: currentUser._id + "" } });
                res.json({});
                return;
            }
            res.status(403).json({ error: "Você não segue este Usuário!" });
            return;
        }
        res.status(404).json({ error: "Usuário não encontrado!" });
    }),
    likePost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            const user = yield User_1.default.findOne({ token: req.body.token }).exec();
            const publication = yield Publication_1.default.findOne({ _id: req.params.id }).exec();
            if (!publication) {
                res.status(404).json({ error: "Publicação não encontrada!" });
                return;
            }
            if (!publication.like.includes(user._id + "")) {
                yield publication.updateOne({ $push: { like: user._id + "" } });
                res.json({ liked: true });
                return;
            }
            else {
                yield publication.updateOne({ $pull: { like: user._id + "" } });
                res.json({ liked: false });
                return;
            }
        }
        res.status(404).json({ error: "Publicação não encontrada" });
    }),
};
//# sourceMappingURL=UserController.js.map