import fs from "fs/promises";
import path from "path";
import { Category } from "@prisma/client";
import { recipeRepository, RecipeWithCategory } from "@/app/lib/repositories/recipeRepository";
import { NotFoundError, ValidationError } from "@/app/lib/errors";

export interface RecipeSearchParams {
  q?: string | null;
  categoryId?: string | null;
  favorite?: string | null;
}

export const recipeService = {
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeWithCategory[]> {
    const q = params.q?.trim().toLowerCase() || undefined;
    const categoryId = params.categoryId ? parseInt(params.categoryId, 10) : undefined;
    const isFavorite = params.favorite === "true" ? true : undefined;

    return recipeRepository.findMany({
      q,
      categoryId: categoryId !== undefined && !isNaN(categoryId) ? categoryId : undefined,
      isFavorite,
    });
  },

  async getRecipeById(id: string): Promise<RecipeWithCategory> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) throw new ValidationError("無効なIDです");

    const recipe = await recipeRepository.findById(numericId);
    if (!recipe) throw new NotFoundError();
    return recipe;
  },

  async createRecipe(body: unknown): Promise<RecipeWithCategory> {
    if (typeof body !== "object" || body === null) {
      throw new ValidationError("リクエストボディが不正です");
    }
    const { title, description, point, ingredients, instructions, servings, cookTime, imagePath, categoryId } =
      body as Record<string, unknown>;

    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError("タイトルは必須です");
    }
    if (title.length > 255) {
      throw new ValidationError("255文字以内で入力してください");
    }
    if (!ingredients || typeof ingredients !== "string" || ingredients.trim() === "") {
      throw new ValidationError("材料は必須です");
    }
    if (!instructions || typeof instructions !== "string" || instructions.trim() === "") {
      throw new ValidationError("作り方は必須です");
    }
    if (categoryId !== undefined && (typeof categoryId !== "number" || !Number.isInteger(categoryId))) {
      throw new ValidationError("無効なカテゴリIDです");
    }
    if (cookTime !== undefined && (!Number.isInteger(cookTime) || (cookTime as number) < 1)) {
      throw new ValidationError("調理時間は正の整数で入力してください");
    }
    if (servings !== undefined && (!Number.isInteger(servings) || (servings as number) < 1)) {
      throw new ValidationError("人数は正の整数で入力してください");
    }

    return recipeRepository.create({
      title: (title as string).trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      point: typeof point === "string" ? point.trim() || null : null,
      ingredients: (ingredients as string).trim(),
      instructions: (instructions as string).trim(),
      servings: typeof servings === "number" ? servings : null,
      cookTime: typeof cookTime === "number" ? cookTime : null,
      imagePath: typeof imagePath === "string" ? imagePath : null,
      categoryId: typeof categoryId === "number" ? categoryId : undefined,
    });
  },

  async updateRecipe(id: string, body: unknown): Promise<RecipeWithCategory> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) throw new ValidationError("無効なIDです");

    const existing = await recipeRepository.findById(numericId);
    if (!existing) throw new NotFoundError();

    if (typeof body !== "object" || body === null) {
      throw new ValidationError("リクエストボディが不正です");
    }
    const { title, description, point, ingredients, instructions, servings, cookTime, imagePath, categoryId } =
      body as Record<string, unknown>;

    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError("タイトルは必須です");
    }
    if (title.length > 255) {
      throw new ValidationError("255文字以内で入力してください");
    }
    if (!ingredients || typeof ingredients !== "string" || ingredients.trim() === "") {
      throw new ValidationError("材料は必須です");
    }
    if (!instructions || typeof instructions !== "string" || instructions.trim() === "") {
      throw new ValidationError("作り方は必須です");
    }
    if (categoryId !== undefined && (typeof categoryId !== "number" || !Number.isInteger(categoryId))) {
      throw new ValidationError("無効なカテゴリIDです");
    }
    if (cookTime !== undefined && (!Number.isInteger(cookTime) || (cookTime as number) < 1)) {
      throw new ValidationError("調理時間は正の整数で入力してください");
    }
    if (servings !== undefined && (!Number.isInteger(servings) || (servings as number) < 1)) {
      throw new ValidationError("人数は正の整数で入力してください");
    }

    return recipeRepository.update(numericId, {
      title: (title as string).trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      point: typeof point === "string" ? point.trim() || null : null,
      ingredients: (ingredients as string).trim(),
      instructions: (instructions as string).trim(),
      servings: typeof servings === "number" ? servings : null,
      cookTime: typeof cookTime === "number" ? cookTime : null,
      imagePath: typeof imagePath === "string" ? imagePath : existing.imagePath,
      categoryId: typeof categoryId === "number" ? categoryId : undefined,
    });
  },

  async deleteRecipe(id: string): Promise<void> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) throw new ValidationError("無効なIDです");

    const recipe = await recipeRepository.findById(numericId);
    if (!recipe) throw new NotFoundError();

    if (recipe.imagePath) {
      const filePath = path.join(process.cwd(), "public", recipe.imagePath);
      await fs.unlink(filePath).catch(() => {});
    }

    await recipeRepository.delete(numericId);
  },

  async toggleFavorite(id: string): Promise<RecipeWithCategory> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) throw new ValidationError("無効なIDです");

    const recipe = await recipeRepository.findById(numericId);
    if (!recipe) throw new NotFoundError();

    return recipeRepository.toggleFavorite(numericId, recipe.isFavorite);
  },

  async getAllCategories(): Promise<Category[]> {
    return recipeRepository.findAllCategories();
  },
};
