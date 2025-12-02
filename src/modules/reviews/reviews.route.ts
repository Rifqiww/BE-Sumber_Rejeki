import { Hono } from "hono";
import { addReview, getProductReviews } from "./reviews.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const reviewsRoute = new Hono();

reviewsRoute.post("/:productId", authMiddleware, addReview);
reviewsRoute.get("/:productId", getProductReviews);

export default reviewsRoute;
