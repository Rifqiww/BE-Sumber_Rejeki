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
import fs from "fs";

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
  // Default to cloudinary as requested
  const provider = body["provider"] || "cloudinary";

  if (!file || !(file instanceof File)) {
    return apiResponse(c, 400, "No image uploaded");
  }

  let imageUrl = "";

  if (provider === "cloudinary") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tempPath = `temp_${Date.now()}_${file.name}`;
      fs.writeFileSync(tempPath, buffer);

      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        folder: "umkm-mamah/product", // Updated to match screenshot
        resource_type: "auto",
      });

      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(tempPath);
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return apiResponse(c, 500, "Failed to upload to Cloudinary");
    }
  } else {
    // Local upload
    const fileName = `${Date.now()}-${file.name}`;
    const path = `./uploads/${fileName}`;

    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
    }

    const arrayBuffer = await file.arrayBuffer();
    await Bun.write(path, arrayBuffer);
    imageUrl = `/uploads/${fileName}`;
  }

  await addProductImage(id, imageUrl, file.name);
  return apiResponse(c, 200, "Image uploaded successfully", { imageUrl });
};
