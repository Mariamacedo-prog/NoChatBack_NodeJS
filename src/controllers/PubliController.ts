import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import sharp from "sharp";
import dotenv from "dotenv";
import { promises } from "fs";
import User from "../models/User";
import Publication from "../models/Publication";
const { unlink } = promises;

dotenv.config();

export default {
  createPublication: async (req: Request, res: Response) => {
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
      res.json({ error: "Categoria não existente" });
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
      res.json({ error: "Escolha uma foto para fazer a publicação!" });
      return;
    }

    await newPublication.save();

    res.json({ publication: newPublication });
  },
  findAllPublications: async (req: Request, res: Response) => {
    let { offset = 0, limit = 15, cat } = req.query;

    let filters: any = {};

    if (cat) {
      filters.category = { $regex: cat, $options: "i" };
    }

    const publication = await Publication.find(filters)
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .exec();

    res.json({ publication, total: publication.length });
  },
};
