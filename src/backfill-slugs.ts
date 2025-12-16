import { drizzleDb as db } from "./config/database";
import { products } from "./db/schema";
import { generateSlug } from "./utils/string.utils";
import { eq, and, ne } from "drizzle-orm";

const ensureUniqueSlug = async (slug: string, productId: number) => {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await db.query.products.findFirst({
      where: and(eq(products.slug, uniqueSlug), ne(products.id, productId)),
    });

    if (!existing) break;

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

const main = async () => {
  console.log("Starting slug backfill...");
  const allProducts = await db.query.products.findMany();

  console.log(`Found ${allProducts.length} products to process.`);

  for (const product of allProducts) {
    if (!product.slug) {
      const baseSlug = generateSlug(product.name);
      const uniqueSlug = await ensureUniqueSlug(baseSlug, product.id);

      await db
        .update(products)
        .set({ slug: uniqueSlug })
        .where(eq(products.id, product.id));

      console.log(`Updated product ${product.id}: ${uniqueSlug}`);
    }
  }

  console.log("Backfill complete!");
  process.exit(0);
};

main();
