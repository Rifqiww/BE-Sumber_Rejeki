import { eq } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { users } from "../../db/schema";
import { signToken } from "../../utils/jwt";
import bcrypt from "bcryptjs";

export const register = async (data: typeof users.$inferInsert) => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));
  if (existingUser.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const [result] = await db
    .insert(users)
    .values({ ...data, password: hashedPassword, role: "user" });

  return { id: result.insertId, ...data };
};

export const login = async (data: typeof users.$inferInsert) => {
  console.log(`Login attempt for: ${data.email}`);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));
  if (!user) {
    console.log("User not found");
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    console.log("Password mismatch");
    throw new Error("Invalid credentials");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const getMe = async (userId: number) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new Error("User not found");

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
