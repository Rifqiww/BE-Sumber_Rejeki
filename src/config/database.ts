import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../db/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

export const drizzleDb = drizzle(connection, { schema, mode: "default" });
