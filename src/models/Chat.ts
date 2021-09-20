import { Schema, model, connection } from "mongoose";

export interface ChatType {
  messages: [];
  users: [];
}

const schema = new Schema<ChatType>({
  messages: [],
  users: [],
});

const modelName: string = "Chat";

export default connection && connection.models[modelName]
  ? connection.models[modelName]
  : model<ChatType>(modelName, schema);
