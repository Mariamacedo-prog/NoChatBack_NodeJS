import { Schema, model, connection, Document } from "mongoose";


export interface CommentData {
  author: string;
  msg: string;
  date: Date | string;
  type: string;
  id: string;
  username?: string;
  avatar?: string;
};
export interface PublicationType extends Document {
  _doc?: any;
  category: "publication" | "article" | "picture";
  userId: string;
  description: string;
  title?: string;
  image?: string;
  like?: string[];
  comment?: CommentData[];
  share?: string[];
  deslike?: string[];
}

const schema = new Schema<PublicationType>(
  {
    category: { type: String, required: true },
    userId: { type: String, required: true },
    description: { type: String, required: true },
    like: [],
    comment: [],
    title: String,
    deslike: [],
    image: String,
    share: [],
  },
  { timestamps: true }
);

const modelName: string = "Publication";

export default  model<PublicationType>(modelName, schema);
