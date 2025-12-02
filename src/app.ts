import { Hono } from "hono";
import { logger } from "hono/logger";
import { corsMiddleware } from "./middleware/cors.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import authRoute from "./modules/auth/auth.route";
import categoryRoute from "./modules/category/category.route";
import productRoute from "./modules/product/product.route";
import checkoutRoute from "./modules/checkout/checkout.route";
import paymentRoute from "./modules/payments/payment.route";
import likesRoute from "./modules/likes/likes.route";
import reviewsRoute from "./modules/reviews/reviews.route";
import { serveStatic } from "hono/bun";

const app = new Hono();

// Global Middleware
app.use("*", logger());
app.use("*", corsMiddleware);
app.use("*", errorMiddleware);

// Serve static files (uploads)
app.use("/uploads/*", serveStatic({ root: "./" }));

// Routes
app.route("/auth", authRoute);
app.route("/categories", categoryRoute);
app.route("/products", productRoute);
app.route("/checkouts", checkoutRoute);
app.route("/payments", paymentRoute);
app.route("/likes", likesRoute);
app.route("/reviews", reviewsRoute);

// Health Check
app.get("/", (c) => c.json({ message: "UMKM Backend API is running" }));

export default app;
