import { eq, and } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { userLikes } from "../../db/schema";

export const toggleLike = async (userId: number, productId: number) => {
  const [existingLike] = await db
    .select()
    .from(userLikes)
    .where(
      and(eq(userLikes.user_id, userId), eq(userLikes.product_id, productId))
    );

  if (existingLike) {
    await db.delete(userLikes).where(eq(userLikes.id, existingLike.id));
    return { liked: false };
  } else {
    await db
      .insert(userLikes)
      .values({ user_id: userId, product_id: productId });
    return { liked: true };
  }
};

export const getLikesByUser = async (userId: number) => {
  return await db.query.userLikes.findMany({
    where: eq(userLikes.user_id, userId),
    with: {
      product: true,
    },
  });
};
