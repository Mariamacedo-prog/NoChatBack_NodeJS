import { Schema, model, connection, Document } from "mongoose";

export interface ChatUserType {
  chatId: string;
  avatar: string;
  lastMessage: string;
  lastMessageDate: Date;
  title: string;
  with: string;
  id: string;
}

export interface ChatType extends Document {
  messages: [];
  users: [];
  chatId: string;
}

const schema = new Schema<ChatType>({
  messages: [],
  users: [],
  chatId: { type: String },
});

const modelName: string = "Chat";

export default connection && connection.models[modelName]
  ? connection.models[modelName]
  : model<ChatType>(modelName, schema);
