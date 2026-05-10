export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  point?: string;
  ingredients: string;
  instructions: string;
  servings?: number;
  cookTime?: number;
  imagePath?: string;
  isFavorite: boolean;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
}
