import { Schema, model, connection } from "mongoose";

export interface UserType {
  email: string;
  passwordHash: string;
  token: string;
  name: string;
  description?: string;
  avatar?: string;
  friends: [];
  idols: [];
  stalkers: [];
  community: [];
  chats: [];
  pictures: [];
  publications: [];
  articles: [];
}

const schema = new Schema<UserType>({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  token: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  description: String,
  avatar: String,
  friends: [],
  idols: [],
  stalkers: [],
  community: [],
  chats: [],
  pictures: [],
  publications: [],
  articles: [],
});

const modelName: string = "User";

export default connection && connection.models[modelName]
  ? connection.models[modelName]
  : model<UserType>(modelName, schema);
