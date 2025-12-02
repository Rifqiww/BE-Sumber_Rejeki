import { drizzleDb as db } from "./config/database";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const checkUser = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: bun run src/check-user.ts <email>");
    process.exit(1);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (user) {
    console.log("User found:");
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password Hash: ${user.password.substring(0, 10)}...`);
  } else {
    console.log("User not found.");
  }
  process.exit(0);
};

checkUser();
