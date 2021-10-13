import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Publication from "../models/Publication";
import { v4 as uuidv4 } from "uuid";

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

    let categories: string[] = ["publication", "article", "picture"];

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
      const fileKey: any = req.file;

      newPublication.image = `${fileKey.location}`;
    }

    if (data.category == "picture" && !req.file) {
      res
        .status(400)
        .json({ error: "Escolha uma foto para fazer a publicação!" });
      return;
    }

    await newPublication.save();

    res.status(201).json(newPublication);
  },
  editAction: async (req: Request, res: Response) => {
    let { description, title } = req.body;
    let { id } = req.params;

    if (mongoose.Types.ObjectId.isValid(id)) {
      const publication = await Publication.findOne({ _id: id });
      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada!" });
        return;
      }
      const loggedUser = await User.findOne({ token: req.query.token });
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

      const updatedPublication = await publication.save();

      res.json(updatedPublication);
      return;
    }

    res.status(404).json({ error: "Publicação não encontrada!" });
  },
  deleteAction: async (req: Request, res: Response) => {
    let { id } = req.params;
    let { token } = req.body;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findOne({ token });
      const publication = await Publication.findOne({ _id: id });

      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada" });
        return;
      }

      if (user._id + "" != publication.userId) {
        res
          .status(400)
          .json({ error: "Esta publição não pertence ao usuario" });
        return;
      }

      await publication.remove();

      res.json({});
    } else {
      res.status(404).json({ error: "Publicação não encontrada!" });
    }
  },
  findPublication: async (req: Request, res: Response) => {
    let id = req.body.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const publication = await Publication.findOne({ _id: id });
      if (!publication) {
        res.status(404).json({ error: "Publicação não encontrada!" });
        return;
      }
      const user = await User.findOne({ _id: publication.userId });

      if (!user) {
        res.status(404).json({ error: "Usuario não encontrado!" });
        return;
      }

      const infoPublication = { ...publication._doc };
      infoPublication.username = user.name;
      if (user.avatar) {
        infoPublication.avatar = user.avatar;
      }

      let allUsers = await User.find();
      const commentUser = infoPublication.comment.map((item: any) => {
        const ownerComment: any = allUsers.filter(
          (user: any) => user._id + "" == item.author
        );

        if (!ownerComment) {
          res.json({ error: "Nenhuma usuario encontrado" });
          return;
        }
        const comment: any = { ...item };
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
  },
  findAllPublications: async (req: Request, res: Response) => {
    let { sort = "asc", offset = 0, limit = 15, cat, q, author } = req.query;

    let filters: any = {};

    if (q) {
      filters.description = { $regex: q, $options: "i" };
    }

    if (cat) {
      filters.category = { $regex: cat, $options: "i" };
    }

    if (author) {
      filters.userId = author;
    }
    const publications = await Publication.find(filters)
      .sort({ createdAt: sort == "desc" ? -1 : 1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .exec();

    if (publications.length == 0) {
      res.json({ error: "Nenhuma publicação encontrada" });
      return;
    }

    let user = await User.find();

    const posts = publications.map((item) => {
      const ownerPost: any = user.filter(
        (user) => user._id + "" == item.userId
      );
      if (!ownerPost) {
        res.json({ error: "Nenhuma usuario encontrado" });
        return;
      }
      const newItem: any = { ...item._doc };

      newItem.username = ownerPost[0].name;
      if (ownerPost[0].avatar) {
        newItem.avatar = ownerPost[0].avatar;
      }

      const commentUser = item.comment.map((item: any) => {
        const ownerComment: any = user.filter(
          (user) => user._id + "" == item.author
        );
        if (!ownerComment) {
          res.json({ error: "Nenhuma usuario encontrado" });
          return;
        }
        const comment: any = { ...item };
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
      if (msg == "") {
        res.json({ error: "Digite algo..." });
        return;
      }

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
    const id = req.params.id;
    const currentUser = await User.findOne({ token: req.body.token });

    const post = await Publication.findOne({
      "comment.id": id,
    });

    if (!post) {
      res.status(404).json({ error: "Mensagem não encontrada!" });
      return;
    }

    const messageAuhor: string[] = [];

    post.comment.map((msg: MessageType) =>
      msg.id == id ? messageAuhor.push(msg.author) : false
    );

    if (messageAuhor[0] == currentUser._id + "") {
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
    }
  },
};
