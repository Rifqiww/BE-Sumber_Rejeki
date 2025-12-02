import { Hono } from "hono";
import { toggle, getMyLikes } from "./likes.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const likesRoute = new Hono();

likesRoute.post("/:productId", authMiddleware, toggle);
likesRoute.get("/me", authMiddleware, getMyLikes);

export default likesRoute;
