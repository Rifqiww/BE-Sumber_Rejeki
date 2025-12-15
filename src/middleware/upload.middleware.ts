import type { Context, Next } from "hono";
import { apiResponse } from "../utils/response";

export const uploadMiddleware = async (c: Context, next: Next) => {
  const contentType = c.req.header("Content-Type");

  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    await next();
    return;
  }

  await next();
};
