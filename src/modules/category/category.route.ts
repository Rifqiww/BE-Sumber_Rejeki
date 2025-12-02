import { Hono } from "hono";
import {
  getCategories,
  getCategory,
  create,
  update,
  remove,
} from "./category.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const categoryRoute = new Hono();

categoryRoute.get("/", getCategories);
categoryRoute.get("/:id", getCategory);
categoryRoute.post("/", authMiddleware, create);
categoryRoute.put("/:id", authMiddleware, update);
categoryRoute.delete("/:id", authMiddleware, remove);

export default categoryRoute;
