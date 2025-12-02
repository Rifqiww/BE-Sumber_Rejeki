import { Hono } from "hono";
import {
  getProducts,
  getProduct,
  create,
  update,
  remove,
  uploadImage,
} from "./product.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { uploadMiddleware } from "../../middleware/upload.middleware";

const productRoute = new Hono();

productRoute.get("/", getProducts);
productRoute.get("/:id", getProduct);
productRoute.post("/", authMiddleware, create);
productRoute.put("/:id", authMiddleware, update);
productRoute.delete("/:id", authMiddleware, remove);
productRoute.post("/:id/images", authMiddleware, uploadMiddleware, uploadImage);

export default productRoute;
