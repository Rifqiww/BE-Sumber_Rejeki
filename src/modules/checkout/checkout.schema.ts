import { z } from "zod";
import { VALID_CHECKOUT_STATUSES } from "./checkout.constants";

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

export const updateStatusSchema = z.object({
  status: z.string().refine((val) => VALID_CHECKOUT_STATUSES.includes(val), {
    message: `Status harus salah satu dari: ${VALID_CHECKOUT_STATUSES.join(
      ", "
    )}`,
  }),
});
