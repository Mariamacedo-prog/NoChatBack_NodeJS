import { Request } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import aws from "aws-sdk";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

const MAX_SIZE_TWO_MEGABYTES = 2 * 1024 * 1024;

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "tmp"));
    },
    filename: (req, file: any, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        file.key = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, file.key);
      });
    },
  }),
  s3: multerS3({
    s3: new aws.S3(),
    bucket: process.env.BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);

        const fileName = `${hash.toString("hex")}-${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
};

export default {
  dest: path.resolve(__dirname, "..", "..", "tmp"),
  storage: storageTypes.s3,
  fileFilter: (req: Request, file: any, cb: any) => {
    const allowed: string[] = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fieldSize: MAX_SIZE_TWO_MEGABYTES },
};
