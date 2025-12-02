import { eq } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { addresses } from "../../db/schema";

export const createAddress = async (data: typeof addresses.$inferInsert) => {
  const [result] = await db.insert(addresses).values(data);
  return { id: result.insertId, ...data };
};

export const getAddressById = async (id: number) => {
  const [address] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, id));
  return address;
};
