import { eq, desc, and, ne } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { products, productsImages } from "../../db/schema";
import cloudinary from "../../config/cloudinary";
import { generateSlug } from "../../utils/string.utils";

// Helper to ensure unique slug
const ensureUniqueSlug = async (slug: string, productId?: number) => {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    // Check if slug exists
    const existing = await db.query.products.findFirst({
      where: and(
        eq(products.slug, uniqueSlug),
        // If updating, exclude current product
        productId ? ne(products.id, productId) : undefined
      ),
    });

    if (!existing) break;

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

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

export const createProduct = async (
  data: Omit<typeof products.$inferInsert, "slug" | "id">
) => {
  const slug = generateSlug(data.name);
  const uniqueSlug = await ensureUniqueSlug(slug);

  const [result] = await db.insert(products).values({
    ...data,
    slug: uniqueSlug,
  });
  return { id: result.insertId, ...data, slug: uniqueSlug };
};

export const updateProduct = async (
  id: number,
  data: Partial<Omit<typeof products.$inferInsert, "slug" | "id">>
) => {
  // Explicitly exclude slug from data to prevent manual updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, ...rest } = data as any;
  let updateData: any = { ...rest };

  if (data.name) {
    const slug = generateSlug(data.name);
    const uniqueSlug = await ensureUniqueSlug(slug, id);
    updateData.slug = uniqueSlug;
  }

  await db.update(products).set(updateData).where(eq(products.id, id));
  return { id, ...updateData };
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
