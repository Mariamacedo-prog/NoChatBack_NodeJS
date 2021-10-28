import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import crypto from "crypto";
import aws from "aws-sdk";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

type FileAws = {
  originalname?: string;
  key?: string;
  mimetype?: string;
};

const MAX_SIZE_TWO_MEGABYTES = 2 * 1024 * 1024;

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "tmp"));
    },
    filename: (req, file: FileAws, cb) => {
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
  fileFilter: (req: Request, file: FileAws, cb: FileFilterCallback) => {
    const allowed: string[] = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, allowed.includes(file.mimetype));
    } else {
      cb(new Error("Imagens somente: jpeg, jpg e png"));
    }
  },
  limits: { fieldSize: MAX_SIZE_TWO_MEGABYTES },
};
