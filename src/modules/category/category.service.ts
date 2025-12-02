import { eq, sql } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { categories } from "../../db/schema";

export const getAllCategories = async () => {
  return await db.select().from(categories);
};

export const getCategoryById = async (id: number) => {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));
  return category;
};

export const createCategory = async (data: typeof categories.$inferInsert) => {
  const [result] = await db.insert(categories).values(data);
  return { id: result.insertId, ...data };
};

export const updateCategory = async (
  id: number,
  data: Partial<typeof categories.$inferInsert>
) => {
  await db.update(categories).set(data).where(eq(categories.id, id));
  return { id, ...data };
};

export const deleteCategory = async (id: number) => {
  await db.delete(categories).where(eq(categories.id, id));

  // Check if table is empty
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories);

  if (countResult && countResult.count === 0) {
    // Reset auto increment
    await db.execute(sql`ALTER TABLE category AUTO_INCREMENT = 1`);
  }

  return true;
};
