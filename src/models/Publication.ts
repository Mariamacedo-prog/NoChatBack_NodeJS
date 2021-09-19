import { Schema, model, connection } from "mongoose";

export interface PublicationType {
  category: "publication" | "article" | "picture";
  userId: string;
  description: string;
  title?: string;
  image?: string;
  like?: [];
  comment?: [];
  share?: [];
  deslike?: [];
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

export default connection && connection.models[modelName]
  ? connection.models[modelName]
  : model<PublicationType>(modelName, schema);
