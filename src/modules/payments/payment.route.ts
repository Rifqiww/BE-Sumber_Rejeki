import { Hono } from "hono";
import { create, notification } from "./payment.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const paymentRoute = new Hono();

paymentRoute.post("/create/:checkoutId", authMiddleware, create);
paymentRoute.post("/notification", notification);

export default paymentRoute;
