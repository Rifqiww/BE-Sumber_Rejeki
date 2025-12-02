import type { Context } from "hono";
import { register, login, getMe } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { apiResponse } from "../../utils/response";

export const registerController = async (c: Context) => {
  const body = await c.req.json();
  const validated = registerSchema.parse(body);
  const user = await register(validated);
  return apiResponse(c, 201, "User registered successfully", user);
};

export const loginController = async (c: Context) => {
  const body = await c.req.json();
  const validated = loginSchema.parse(body);
  const result = await login(validated as any);
  return apiResponse(c, 200, "Login successful", result);
};

export const getMeController = async (c: Context) => {
  const user = c.get("user");
  const result = await getMe(user.id);
  return apiResponse(c, 200, "User profile", result);
};
