import { eq, desc } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { products, productsImages } from "../../db/schema";
import cloudinary from "../../config/cloudinary";

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
  const existingImages = await db.query.productsImages.findMany({
    where: eq(productsImages.product_id, id),
  });

  if (existingImages.length > 0) {
    for (const image of existingImages) {
      if (image.image_url) {
        try {
          const uploadIndex = image.image_url.indexOf("/upload/");
          if (uploadIndex !== -1) {
            let publicIdPath = image.image_url.substring(uploadIndex + 8);
            if (publicIdPath.startsWith("v")) {
              const versionEnd = publicIdPath.indexOf("/");
              if (versionEnd !== -1) {
                publicIdPath = publicIdPath.substring(versionEnd + 1);
              }
            }
            const lastDot = publicIdPath.lastIndexOf(".");
            if (lastDot !== -1) {
              publicIdPath = publicIdPath.substring(0, lastDot);
            }

            if (publicIdPath) {
              await cloudinary.uploader.destroy(publicIdPath);
            }
          }
        } catch (error) {
          console.error(
            `Failed to delete image from Cloudinary: ${image.image_url}`,
            error
          );
        }
      }
    }
  }

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
