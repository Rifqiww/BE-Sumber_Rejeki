import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().min(0),
  category_id: z.number(),
});
