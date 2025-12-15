import { drizzleDb as db } from "./config/database";
import { users } from "./db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const createAdmin = async () => {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      "Usage: bun run src/create-admin.ts <name> <email> <password>"
    );
    process.exit(1);
  }

  const name = args[0] as string;
  const email = args[1] as string;
  const password = args[2] as string;

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      console.log(`User with email ${email} already exists.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin user '${name}' created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
};

createAdmin();
