import { Hono } from "hono";
import {
  registerController,
  loginController,
  getMeController,
} from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const authRoute = new Hono();

authRoute.post("/register", registerController);
authRoute.post("/login", loginController);
authRoute.get("/me", authMiddleware, getMeController);

export default authRoute;
