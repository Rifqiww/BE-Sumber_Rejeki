import { drizzleDb as db } from "./config/database";
import { sql } from "drizzle-orm";

const main = async () => {
  console.log("Adding slug column to product table...");
  try {
    await db.execute(sql`ALTER TABLE product ADD COLUMN slug varchar(255)`);
    console.log("Successfully added 'slug' column.");
  } catch (error: any) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("'slug' column already exists.");
    } else {
      console.error("Error adding column:", error);
    }
  }
  process.exit(0);
};

main();
