import type { Context } from "hono";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
} from "./product.service";
import { productSchema } from "./product.schema";
import { apiResponse } from "../../utils/response";
import cloudinary from "../../config/cloudinary";
import { compressAndUpload } from "../../services/imageOptimization";

export const getProducts = async (c: Context) => {
  const result = await getAllProducts();
  return apiResponse(c, 200, "Products retrieved", result);
};

export const getProduct = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const result = await getProductById(id);
  if (!result) return apiResponse(c, 404, "Product not found");
  return apiResponse(c, 200, "Product retrieved", result);
};

export const create = async (c: Context) => {
  const body = await c.req.json();
  const validated = productSchema.parse(body);
  const result = await createProduct(validated);
  return apiResponse(c, 201, "Product created", result);
};

export const update = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  console.log("Update Product Body:", body);
  const result = await updateProduct(id, body);
  return apiResponse(c, 200, "Product updated", result);
};

export const remove = async (c: Context) => {
  const id = Number(c.req.param("id"));
  await deleteProduct(id);
  return apiResponse(c, 200, "Product deleted");
};

export const uploadImage = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.parseBody();
  const file = body["image"];

  if (!file || !(file instanceof File)) {
    return apiResponse(c, 400, "No image uploaded");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { secure_url } = await compressAndUpload(
      buffer,
      "umkm-mamah/product"
    );

    await addProductImage(id, secure_url, file.name);

    return apiResponse(c, 200, "Image uploaded successfully", {
      imageUrl: secure_url,
    });
  } catch (error: any) {
    console.error("Upload error:", error);

    if (error.message === "Compression timeout") {
      return apiResponse(c, 500, "Try Upload Again (Compression Timed Out)");
    }

    return apiResponse(c, 500, "Failed to process upload");
  }
};
