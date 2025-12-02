import { eq, inArray, desc } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import {
  checkouts,
  productCheckout,
  products,
  addresses,
} from "../../db/schema";
import { createAddress } from "../address/address.service";

interface CheckoutItem {
  product_id: number;
  quantity: number;
}

export const createCheckout = async (
  userId: number,
  addressData: { address: string; zip_code: number },
  items: CheckoutItem[]
) => {
  // 1. Create Address
  const address = await createAddress({ ...addressData, user_id: userId });

  // 2. Calculate Total & Verify Stock
  let totalPrice = 0;
  const productIds = items.map((i) => i.product_id);
  const dbProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const checkoutItemsData = [];

  for (const item of items) {
    const product = dbProducts.find((p) => p.id === item.product_id);
    if (!product) throw new Error(`Product ${item.product_id} not found`);
    if (product.stock < item.quantity)
      throw new Error(`Insufficient stock for ${product.name}`);

    const subtotal = Number(product.price) * item.quantity;
    totalPrice += subtotal;

    checkoutItemsData.push({
      product_id: item.product_id,
      quantity: item.quantity,
      subtotal: subtotal.toString(), // Decimal as string
    });
  }

  // 3. Create Checkout Record
  const [checkoutResult] = await db.insert(checkouts).values({
    user_id: userId,
    address_id: address.id,
    total_price: totalPrice.toString(),
  });

  const checkoutId = checkoutResult.insertId;

  // 4. Create Product Checkout Records
  await db.insert(productCheckout).values(
    checkoutItemsData.map((item) => ({
      ...item,
      checkouts_id: checkoutId,
    }))
  );

  return { checkoutId, totalPrice, address };
};

export const getCheckoutById = async (id: number) => {
  return await db.query.checkouts.findFirst({
    where: eq(checkouts.id, id),
    with: {
      address: true,
      productCheckouts: {
        with: {
          product: true,
        },
      },
    },
  });
};
export const getAllCheckouts = async () => {
  return await db.query.checkouts.findMany({
    with: {
      address: true,
      user: true,
      payment: true,
      productCheckouts: {
        with: {
          product: true,
        },
      },
    },
    orderBy: [desc(checkouts.created_at)],
  });
};
