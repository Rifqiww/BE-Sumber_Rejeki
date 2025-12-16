import { drizzleDb as db } from "./config/database";
import { sql } from "drizzle-orm";

const main = async () => {
  console.log("Applying UNIQUE and NOT NULL constraints to slug...");
  try {
    await db.execute(
      sql`ALTER TABLE product MODIFY slug varchar(255) NOT NULL`
    );
    console.log("Set slug to NOT NULL.");

    await db.execute(
      sql`ALTER TABLE product ADD CONSTRAINT product_slug_unique UNIQUE (slug)`
    );
    console.log("Added UNIQUE constraint.");
  } catch (error: any) {
    console.error("Error modifying constraints:", error);
  }
  process.exit(0);
};

main();
