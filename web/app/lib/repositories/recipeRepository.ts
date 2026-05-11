import { Prisma, Category } from "@prisma/client";
import { prisma } from "@/app/lib/db";

export type RecipeWithCategory = Prisma.RecipeGetPayload<{
  include: { category: true };
}>;

export interface RecipeFilters {
  q?: string;
  categoryId?: number;
  isFavorite?: boolean;
}

export interface RecipeWriteData {
  title: string;
  description?: string | null;
  point?: string | null;
  ingredients: string;
  instructions: string;
  servings?: number | null;
  cookTime?: number | null;
  imagePath?: string | null;
  categoryId?: number;
}

export const recipeRepository = {
  async findMany(filters: RecipeFilters): Promise<RecipeWithCategory[]> {
    return prisma.recipe.findMany({
      where: {
        ...(filters.q
          ? {
              OR: [
                { title: { contains: filters.q } },
                { description: { contains: filters.q } },
              ],
            }
          : {}),
        ...(filters.categoryId !== undefined ? { categoryId: filters.categoryId } : {}),
        ...(filters.isFavorite !== undefined ? { isFavorite: filters.isFavorite } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: number): Promise<RecipeWithCategory | null> {
    return prisma.recipe.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  async create(data: RecipeWriteData): Promise<RecipeWithCategory> {
    return prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        point: data.point ?? null,
        ingredients: data.ingredients,
        instructions: data.instructions,
        servings: data.servings ?? null,
        cookTime: data.cookTime ?? null,
        imagePath: data.imagePath ?? null,
        categoryId: data.categoryId ?? 10,
      },
      include: { category: true },
    });
  },

  async update(id: number, data: RecipeWriteData): Promise<RecipeWithCategory> {
    return prisma.recipe.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description ?? null,
        point: data.point ?? null,
        ingredients: data.ingredients,
        instructions: data.instructions,
        servings: data.servings ?? null,
        cookTime: data.cookTime ?? null,
        imagePath: data.imagePath ?? null,
        categoryId: data.categoryId ?? 10,
      },
      include: { category: true },
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.recipe.delete({ where: { id } });
  },

  async toggleFavorite(id: number, current: boolean): Promise<RecipeWithCategory> {
    return prisma.recipe.update({
      where: { id },
      data: { isFavorite: !current },
      include: { category: true },
    });
  },

  async findAllCategories(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: { id: "asc" } });
  },
};
