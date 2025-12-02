import type { Context } from "hono";
import {
  createCheckout,
  getCheckoutById,
  getAllCheckouts as getAllCheckoutsService,
} from "./checkout.service";
import { checkoutSchema } from "./checkout.schema";
import { apiResponse } from "../../utils/response";

export const processCheckout = async (c: Context) => {
  const user = c.get("user");
  const body = await c.req.json();
  const validated = checkoutSchema.parse(body);

  const result = await createCheckout(
    user.id,
    { address: validated.address, zip_code: validated.zip_code },
    validated.items
  );
  return apiResponse(c, 201, "Checkout successful", result);
};

export const getCheckout = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const result = await getCheckoutById(id);
  if (!result) return apiResponse(c, 404, "Checkout not found");
  return apiResponse(c, 200, "Checkout retrieved", result);
};

export const getAllCheckouts = async (c: Context) => {
  const result = await getAllCheckoutsService();
  return apiResponse(c, 200, "All checkouts retrieved", result);
};
