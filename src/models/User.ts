import { Schema, model, connection } from "mongoose";

export interface UserType {
  email: string;
  passwordHash: string;
  token: string;
  name: string;
  description?: string;
  avatar?: string;
  followings: [];
  followers: [];
  chats: [];
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

export default connection && connection.models[modelName]
  ? connection.models[modelName]
  : model<UserType>(modelName, schema);
