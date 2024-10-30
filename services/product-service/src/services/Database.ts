// src/services/Database.ts
import mongoose from "mongoose";
import {
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
} from "../config";

const connectDatabase = async () => {
  const MONGO_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
  try {
    await mongoose.connect(MONGO_URI, {
      auth: {
        username: DB_USERNAME,
        password: DB_PASSWORD,
      },
    });
    console.log("DB Connected!");
  } catch (error) {
    console.error("DB Connection Error:", error);
    throw error;
  }
};

export default connectDatabase;
