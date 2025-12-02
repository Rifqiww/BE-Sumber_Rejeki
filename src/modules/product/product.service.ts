import { eq, desc } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { products, productsImages } from "../../db/schema";

export const getAllProducts = async () => {
  return await db.query.products.findMany({
    with: {
      category: true,
      images: true,
    },
    orderBy: [desc(products.id)],
  });
};

export const getProductById = async (id: number) => {
  return await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      images: true,
      reviews: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

export const createProduct = async (data: typeof products.$inferInsert) => {
  const [result] = await db.insert(products).values(data);
  return { id: result.insertId, ...data };
};

export const updateProduct = async (
  id: number,
  data: Partial<typeof products.$inferInsert>
) => {
  await db.update(products).set(data).where(eq(products.id, id));
  return { id, ...data };
};

export const deleteProduct = async (id: number) => {
  // Manually cascade delete images first
  await db.delete(productsImages).where(eq(productsImages.product_id, id));
  await db.delete(products).where(eq(products.id, id));
  return true;
};

export const addProductImage = async (
  productId: number,
  imageUrl: string,
  altImage?: string
) => {
  await db.insert(productsImages).values({
    product_id: productId,
    image_url: imageUrl,
    alt_image: altImage,
  });
};
