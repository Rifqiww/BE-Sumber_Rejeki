import { Hono } from "hono";
import {
  processCheckout,
  getCheckout,
  getAllCheckouts,
  updateStatus,
} from "./checkout.controller";
import {
  authMiddleware,
  adminMiddleware,
} from "../../middleware/auth.middleware";

const checkoutRoute = new Hono();

checkoutRoute.get("/", authMiddleware, adminMiddleware, getAllCheckouts);
checkoutRoute.post("/", authMiddleware, processCheckout);
checkoutRoute.get("/:id", authMiddleware, getCheckout);
checkoutRoute.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateStatus
);

export default checkoutRoute;
