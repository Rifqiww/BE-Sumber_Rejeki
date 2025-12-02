import type { Context, Next } from "hono";
import { apiResponse } from "../utils/response";

export const uploadMiddleware = async (c: Context, next: Next) => {
  const contentType = c.req.header("Content-Type");

  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    // If not multipart, just proceed (maybe not an upload request)
    // But if it IS an upload route, the controller should check for body
    await next();
    return;
  }

  // Hono handles multipart parsing automatically in c.req.parseBody()
  // We can add size limits or type checks here if needed in the future
  await next();
};
