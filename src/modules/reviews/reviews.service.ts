import { eq } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { reviews } from "../../db/schema";

export const createReview = async (
  userId: number,
  productId: number,
  review: string
) => {
  const [result] = await db.insert(reviews).values({
    user_id: userId,
    product_id: productId,
    review,
  });
  return {
    id: result.insertId,
    user_id: userId,
    product_id: productId,
    review,
  };
};

export const getReviewsByProduct = async (productId: number) => {
  return await db.query.reviews.findMany({
    where: eq(reviews.product_id, productId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
};
