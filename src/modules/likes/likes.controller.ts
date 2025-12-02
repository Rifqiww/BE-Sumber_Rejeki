import type { Context } from "hono";
import { toggleLike, getLikesByUser } from "./likes.service";
import { apiResponse } from "../../utils/response";

export const toggle = async (c: Context) => {
  const user = c.get("user");
  const productId = Number(c.req.param("productId"));
  const result = await toggleLike(user.id, productId);
  return apiResponse(
    c,
    200,
    result.liked ? "Product liked" : "Product unliked",
    result
  );
};

export const getMyLikes = async (c: Context) => {
  const user = c.get("user");
  const result = await getLikesByUser(user.id);
  return apiResponse(c, 200, "My likes retrieved", result);
};
