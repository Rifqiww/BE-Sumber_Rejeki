import type { Context } from "hono";
import { createPayment, handleNotification } from "./payment.service";
import { apiResponse } from "../../utils/response";

export const create = async (c: Context) => {
  const checkoutId = Number(c.req.param("checkoutId"));
  const result = await createPayment(checkoutId);
  return apiResponse(c, 201, "Payment transaction created", result);
};

export const notification = async (c: Context) => {
  const body = await c.req.json();
  const result = await handleNotification(body);
  return apiResponse(c, 200, "Notification processed", result);
};
