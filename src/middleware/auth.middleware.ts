import type { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt";
import { apiResponse } from "../utils/response";
import { getMe } from "../modules/auth/auth.service";

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

  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
    return apiResponse(c, 401, "Invalid or expired token");
  }

  try {
    // @ts-ignore
    const user = await getMe(Number(decoded.id));
    c.set("user", user);
    await next();
  } catch (error) {
    return apiResponse(c, 401, "User not found or access revoked");
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return apiResponse(c, 403, "Forbidden: Admin access required");
  }
  await next();
};
