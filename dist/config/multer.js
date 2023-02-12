"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MAX_SIZE_TWO_MEGABYTES = 2 * 1024 * 1024;
const storageTypes = {
    local: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path_1.default.resolve(__dirname, "..", "..", "tmp"));
        },
        filename: (req, file, cb) => {
            crypto_1.default.randomBytes(16, (err, hash) => {
                file.key = `${hash.toString("hex")}-${file.originalname}`;
                cb(null, file.key);
            });
        },
    }),
    s3: (0, multer_s3_1.default)({
        s3: new aws_sdk_1.default.S3(),
        bucket: process.env.BUCKET_NAME,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        acl: "public-read",
        key: (req, file, cb) => {
            crypto_1.default.randomBytes(16, (err, hash) => {
                if (err)
                    cb(err);
                const fileName = `${hash.toString("hex")}-${file.originalname}`;
                cb(null, fileName);
            });
        },
    }),
};
exports.default = {
    dest: path_1.default.resolve(__dirname, "..", "..", "tmp"),
    storage: storageTypes.s3,
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, allowed.includes(file.mimetype));
        }
        else {
            cb(new Error("Imagens somente: jpeg, jpg e png"));
        }
    },
    limits: { fieldSize: MAX_SIZE_TWO_MEGABYTES },
};
//# sourceMappingURL=multer.js.map