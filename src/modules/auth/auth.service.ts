import { eq } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { users } from "../../db/schema";
import { signToken } from "../../utils/jwt";
import bcrypt from "bcryptjs";
import { HTTPException } from "hono/http-exception";

export const register = async (data: typeof users.$inferInsert) => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));
  if (existingUser.length > 0) {
    throw new HTTPException(409, { message: "Email already exists" });
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
    throw new HTTPException(401, { message: "Email not registered" });
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    console.log("Password mismatch");
    throw new HTTPException(401, { message: "Wrong Password" });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const getMe = async (userId: number) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new HTTPException(404, { message: "User not found" });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
