import type { Context } from "hono";
import { createReview, getReviewsByProduct } from "./reviews.service";
import { apiResponse } from "../../utils/response";

export const addReview = async (c: Context) => {
  const user = c.get("user");
  const productId = Number(c.req.param("productId"));
  const body = await c.req.json();

  if (!body.review) return apiResponse(c, 400, "Review content is required");

  const result = await createReview(user.id, productId, body.review);
  return apiResponse(c, 201, "Review added", result);
};

export const getProductReviews = async (c: Context) => {
  const productId = Number(c.req.param("productId"));
  const result = await getReviewsByProduct(productId);
  return apiResponse(c, 200, "Reviews retrieved", result);
};
