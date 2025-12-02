import { z } from "zod";

export const checkoutSchema = z.object({
  address: z.string().min(5),
  zip_code: z.number(),
  items: z
    .array(
      z.object({
        product_id: z.number(),
        quantity: z.number().min(1),
      })
    )
    .min(1),
});
