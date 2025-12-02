import type { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt";
import { apiResponse } from "../utils/response";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiResponse(c, 401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return apiResponse(c, 401, "Unauthorized");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return apiResponse(c, 401, "Invalid or expired token");
  }

  c.set("user", decoded);
  await next();
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return apiResponse(c, 403, "Forbidden: Admin access required");
  }
  await next();
};
