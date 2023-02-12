import { Schema, model, connection, Document } from "mongoose";

export interface MessageType {
  author: string;
  msg: string;
  date: Date;
  type: string;
  id: string;
}
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
  messages: MessageType[];
  users: string[];
  chatId: string;
  username?: string;
  avatar?: string;
  _doc?: any;
}

const schema = new Schema<ChatType>({
  messages: [],
  users: [],
  chatId: { type: String },
});

const modelName: string = "Chat";

export default model<ChatType>(modelName, schema);
