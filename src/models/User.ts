import { Schema, model, Model, connection, Document } from "mongoose";

export interface UserType extends Document {
  email: string;
  passwordHash: string;
  token: string;
  name: string;
  description?: string;
  avatar?: string;
  followings: string[];
  followers: string[];
  chats: [];
  _doc?: any;
}

const schema = new Schema<UserType>(
  {
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    token: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: String,
    avatar: String,
    followings: [],
    followers: [],
    chats: [],
  },
  { timestamps: true }
);

const modelName: string = "User";

export default model<UserType>(modelName, schema);
