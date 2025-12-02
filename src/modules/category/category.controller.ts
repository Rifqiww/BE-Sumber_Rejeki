import type { Context } from "hono";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.service";
import { apiResponse } from "../../utils/response";

export const getCategories = async (c: Context) => {
  const result = await getAllCategories();
  return apiResponse(c, 200, "Categories retrieved", result);
};

export const getCategory = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const result = await getCategoryById(id);
  if (!result) return apiResponse(c, 404, "Category not found");
  return apiResponse(c, 200, "Category retrieved", result);
};

export const create = async (c: Context) => {
  const body = await c.req.json();
  const result = await createCategory(body);
  return apiResponse(c, 201, "Category created", result);
};

export const update = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = await updateCategory(id, body);
  return apiResponse(c, 200, "Category updated", result);
};

export const remove = async (c: Context) => {
  const id = Number(c.req.param("id"));
  await deleteCategory(id);
  return apiResponse(c, 200, "Category deleted");
};
