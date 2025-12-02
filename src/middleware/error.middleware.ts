import type { Context, Next } from "hono";
import { ZodError } from "zod";
import { apiResponse } from "../utils/response";

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err: any) {
    console.error(err);

    if (err instanceof ZodError) {
      return apiResponse(c, 400, "Validation Error", err.issues);
    }

    return apiResponse(c, 500, err.message || "Internal Server Error");
  }
};
