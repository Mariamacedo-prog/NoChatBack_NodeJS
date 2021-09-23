import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import mongoose from "mongoose";
import sharp from "sharp";
import dotenv from "dotenv";
import { promises } from "fs";
import User from "../models/User";
import { v4 as uuidv4 } from "uuid";
import Publication from "../models/Publication";
const { unlink } = promises;

dotenv.config();

interface MessageType {
  author: string;
  msg: string;
  date: Date;
  type: string;
  id: string;
}

export default {
  createAction: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() });
      return;
    }
    const data = matchedData(req);

    const user = await User.findOne({ token: data.token });

    let newPublication = new Publication();

    if (
      data.category !== "publication" &&
      data.category !== "article" &&
      data.category !== "picture"
    ) {
      res.status(400).json({ error: "Categoria não existente" });
      return;
    }

    newPublication.category = data.category;
    newPublication.userId = user._id;
    newPublication.description = data.description;

    if (data.category === "article") {
      newPublication.title = data.title;
    }

    if (req.file) {
      const filename = `${data.category}${req.file.filename}.jpg`;
      await sharp(req.file.path)
        .resize(500, 500)
        .toFormat("jpg")
        .toFile(`./public/media/${filename}`);

      await unlink(req.file.path);

      newPublication.image = `${filename}`;
    }

    if (data.category == "picture" && !req.file) {
      res
        .status(400)
        .json({ error: "Escolha uma foto para fazer a publicação!" });
      return;
    }

    await newPublication.save();

    res.status(201).json({ publication: newPublication });
  },
  editAction: async (req: Request, res: Response) => {
    let { description, title, token } = req.body;
    let id = req.params.id;

    if (mongoose.Types.ObjectId.isValid(id)) {
      const publication = await Publication.findOne({ _id: id });
      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada!" });
        return;
      }

      const loggedUser = await User.findOne({ token });
      if (loggedUser._id != publication.userId) {
        res
          .status(400)
          .json({ error: "Publicação não pertence a este usuario!" });
        return;
      }

      if (description) {
        publication.description = description;
      }

      if (publication.category == "article" && title) {
        publication.title = title;
      }

      await publication.save();

      res.json({ publication });
    }

    res.status(404).json({ error: "Publicação não encontrada!" });
  },
  deleteAction: async (req: Request, res: Response) => {
    let id = req.params.id;

    if (mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findOne({ token: req.body.token });

      const publication = await Publication.findOne({ _id: id });

      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada" });
        return;
      }

      if (user._id != publication.userId) {
        res
          .status(400)
          .json({ error: "Esta publição não pertence ao usuario" });
        return;
      }

      await publication.remove();
      res.json({});
    }

    res.status(404).json({ error: "Publicação não encontrada" });
  },
  findPublication: async (req: Request, res: Response) => {
    let id = req.params.id;

    if (mongoose.Types.ObjectId.isValid(id)) {
      const publication = await Publication.findOne({ _id: id });

      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada!" });
        return;
      }

      res.json({ publication });
    } else {
      res.status(404).json({ error: "Publicação não encontrada!" });
    }
  },
  findAllPublications: async (req: Request, res: Response) => {
    let { offset = 0, limit = 15, cat, q } = req.query;

    let filters: any = {};

    if (q) {
      filters.description = { $regex: q, $options: "i" };
    }

    if (cat) {
      filters.category = { $regex: cat, $options: "i" };
    }

    const publication = await Publication.find(filters)
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .exec();

    if (publication.length == 0) {
      res.json({ error: "Nenhuma publicação encontrada" });
      return;
    }

    res.json({ publication, total: publication.length });
  },
  createCommentAction: async (req: Request, res: Response) => {
    const { token, postId, type, msg } = req.body;

    if (mongoose.Types.ObjectId.isValid(postId)) {
      const currentUser = await User.findOne({ token });
      const post = await Publication.findOne({ _id: postId });
      if (!post) {
        res.json({ error: "Publicação não encontrado" });
        return;
      }
      let date = new Date();

      await post.updateOne({
        $push: {
          comment: {
            author: currentUser._id + "",
            msg,
            date,
            type,
            id: uuidv4(),
          },
        },
      });
      res.json({});
      return;
    }
    res.json({ error: "Publicação não encontrado" });
  },
  deleteCommentAction: async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUser = await User.findOne({ token: req.body.token });

    const post = await Publication.findOne({
      "comment.id": id,
    });

    if (!post) {
      res.status(404).json({ error: "Mensagem não encontrada!" });
      return;
    }

    const comment: string[] = [];
    post.comment.map((msg: MessageType) =>
      msg.id == id ? comment.push(msg.author) : false
    );

    if (comment[0] == currentUser._id + "") {
      await Publication.updateOne(
        {
          _id: post._id,
          "comment.id": id,
        },
        {
          $set: {
            "comment.$.msg": "Esta mensagem foi apagada!",
            "comment.$.type": "deleted",
          },
        }
      );

      res.json({});
    } else {
      res.status(404).json({ error: "Você não pode apagar essa mensagem!" });
      return;
    }
  },
};
