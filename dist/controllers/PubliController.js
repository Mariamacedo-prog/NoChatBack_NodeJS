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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Publication_1 = __importDefault(require("../models/Publication"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
exports.default = {
    createAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = (0, express_validator_1.matchedData)(req);
        const user = yield User_1.default.findOne({ token: data.token });
        let newPublication = new Publication_1.default();
        let categories = ["publication", "article", "picture"];
        if (!categories.includes(data.category)) {
            res.status(400).json({ error: "Categoria não existente" });
            return;
        }
        newPublication.category = data.category;
        newPublication.userId = user._id;
        newPublication.description = data.description;
        if (data.category === "article") {
            if (!data.title || !data.description) {
                res
                    .status(400)
                    .json({ error: "Artigos precisam de titulo e conteúdo!" });
                return;
            }
            newPublication.title = data.title;
        }
        if (req.file) {
            const fileKey = req.file;
            newPublication.image = `${fileKey.location}`;
        }
        if (data.category == "picture" && !req.file) {
            res
                .status(400)
                .json({ error: "Escolha uma foto para fazer a publicação!" });
            return;
        }
        yield newPublication.save();
        res.status(201).json(newPublication);
    }),
    editAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { description, title } = req.body;
        let { id } = req.params;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            const publication = yield Publication_1.default.findOne({ _id: id });
            if (!publication) {
                res.status(404).json({ error: "Publicação não encontrada!" });
                return;
            }
            const loggedUser = yield User_1.default.findOne({ token: req.query.token });
            if (loggedUser._id != publication.userId) {
                res
                    .status(400)
                    .json({ error: "Publicação não pertence a este Usuário!" });
                return;
            }
            if (description) {
                publication.description = description;
            }
            if (publication.category == "article" && title) {
                publication.title = title;
            }
            const updatedPublication = yield publication.save();
            res.json(updatedPublication);
            return;
        }
        res.status(404).json({ error: "Publicação não encontrada!" });
    }),
    deleteAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { id } = req.params;
        let { token } = req.body;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            const user = yield User_1.default.findOne({ token });
            const publication = yield Publication_1.default.findOne({ _id: id });
            if (!publication) {
                res.status(404).json({ error: "Publicação não encontrada" });
                return;
            }
            if (user._id + "" != publication.userId) {
                res
                    .status(400)
                    .json({ error: "Esta publicação não pertence ao Usuário" });
                return;
            }
            yield publication.remove();
            res.json({});
        }
        else {
            res.status(404).json({ error: "Publicação não encontrada!" });
        }
    }),
    findPublication: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let id = req.body.id;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            const publication = yield Publication_1.default.findOne({ _id: id });
            if (!publication) {
                res.status(404).json({ error: "Publicação não encontrada!" });
                return;
            }
            const user = yield User_1.default.findOne({ _id: publication.userId });
            if (!user) {
                res.status(404).json({ error: "Usuário não encontrado!" });
                return;
            }
            const infoPublication = Object.assign({}, publication._doc);
            infoPublication.username = user.name;
            if (user.avatar) {
                infoPublication.avatar = user.avatar;
            }
            let allUsers = yield User_1.default.find();
            const commentUser = infoPublication.comment.map((item) => {
                const ownerComment = allUsers.filter((user) => user._id + "" == item.author);
                if (!ownerComment) {
                    res.json({ error: "Nenhuma usuário encontrado" });
                    return;
                }
                const comment = Object.assign({}, item);
                comment.username = ownerComment[0].name;
                if (ownerComment[0].avatar) {
                    comment.avatar = ownerComment[0].avatar;
                }
                return comment;
            });
            infoPublication.comment = commentUser;
            res.json(infoPublication);
            return;
        }
        res.status(404).json({ error: "Publicação não encontrada!" });
    }),
    findAllPublications: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { sort = "asc", offset = 0, limit = 15, cat, q, author } = req.query;
        let filters = {};
        if (q) {
            filters.description = { $regex: q, $options: "i" };
        }
        if (cat) {
            filters.category = { $regex: cat, $options: "i" };
        }
        if (author) {
            filters.userId = author;
        }
        const publications = yield Publication_1.default.find(filters)
            .sort({ createdAt: sort == "desc" ? -1 : 1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec();
        if (publications.length == 0) {
            res.json({ error: "Nenhuma publicação encontrada" });
            return;
        }
        let user = yield User_1.default.find();
        const posts = publications.map((item) => {
            const ownerPost = user.filter((user) => user._id + "" == item.userId);
            if (!ownerPost) {
                res.json({ error: "Nenhuma Usuário encontrado" });
                return;
            }
            const newItem = Object.assign({}, item._doc);
            newItem.username = ownerPost[0].name;
            if (ownerPost[0].avatar) {
                newItem.avatar = ownerPost[0].avatar;
            }
            const commentUser = item.comment.map((item) => {
                const ownerComment = user.filter((user) => user._id + "" == item.author);
                if (!ownerComment) {
                    res.json({ error: "Nenhuma Usuário encontrado" });
                    return;
                }
                const comment = Object.assign({}, item);
                comment.username = ownerComment[0].name;
                if (ownerComment[0].avatar) {
                    comment.avatar = ownerComment[0].avatar;
                }
                return comment;
            });
            newItem.comment = commentUser;
            return newItem;
        });
        res.json({ publications: posts, total: publications.length });
    }),
    createCommentAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { token, postId, type, msg } = req.body;
        if (mongoose_1.default.Types.ObjectId.isValid(postId)) {
            const currentUser = yield User_1.default.findOne({ token });
            const post = yield Publication_1.default.findOne({ _id: postId });
            if (!post) {
                res.json({ error: "Publicação não encontrado" });
                return;
            }
            let date = new Date();
            if (msg == "") {
                res.json({ error: "Digite algo..." });
                return;
            }
            yield post.updateOne({
                $push: {
                    comment: {
                        author: currentUser._id + "",
                        msg,
                        date,
                        type,
                        id: (0, uuid_1.v4)(),
                    },
                },
            });
            res.json({});
            return;
        }
        res.json({ error: "Publicação não encontrado" });
    }),
    deleteCommentAction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        const currentUser = yield User_1.default.findOne({ token: req.body.token });
        const post = yield Publication_1.default.findOne({
            "comment.id": id,
        });
        if (!post) {
            res.status(404).json({ error: "Mensagem não encontrada!" });
            return;
        }
        const messageAuhor = [];
        post.comment.map((msg) => msg.id == id ? messageAuhor.push(msg.author) : false);
        if (messageAuhor[0] == currentUser._id + "") {
            yield Publication_1.default.updateOne({
                _id: post._id,
                "comment.id": id,
            }, {
                $set: {
                    "comment.$.msg": "Esta mensagem foi apagada!",
                    "comment.$.type": "deleted",
                },
            });
            res.json({});
        }
        else {
            res.status(404).json({ error: "Você não pode apagar essa mensagem!" });
        }
    }),
};
//# sourceMappingURL=PubliController.js.map