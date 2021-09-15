import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const mongoConnect = async () => {
  try {
    console.log("Conectando com o mongo...");
    await connect(process.env.MONGO_URL as string);
    console.log("MongoDB conectado com sucesso");
  } catch (error) {
    console.log("erro na conexão com o mongo", error);
  }
};
