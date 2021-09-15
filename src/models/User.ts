import { Schema, model, connection } from "mongoose";

interface UserType {
  email: string;
  passwordHash: string;
  token: string;
  name: string;
  description?: string;
  friends: [];
  idols: [];
  stalkers: [];
  community: [];
  chats: [];
  pictures: [];
  publications: [];
  aticles: [];
}

const schema = new Schema<UserType>({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  token: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  friends: [],
  idols: [],
  stalkers: [],
  community: [],
  chats: [],
  pictures: [],
  publications: [],
  aticles: [],
});

const modelName: string = "User";

export default connection && connection.models[modelName]
  ? connection.models[modelName]
  : model<UserType>(modelName, schema);
