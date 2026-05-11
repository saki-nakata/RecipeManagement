import type { Recipe, Category } from '@/app/lib/types'

export interface RecipeSearchParams {
  q?: string
  categoryId?: number
  favorite?: boolean
}

export interface RecipeInput {
  title: string
  description?: string
  point?: string
  ingredients: string
  instructions: string
  servings?: number
  cookTime?: number
  imagePath?: string
  categoryId?: number
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'エラーが発生しました' }))
    throw new Error(error.message || 'エラーが発生しました')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const apiClient = {
  getRecipes: (params: RecipeSearchParams = {}): Promise<Recipe[]> => {
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.categoryId) query.set('categoryId', String(params.categoryId))
    if (params.favorite) query.set('favorite', 'true')
    return request<Recipe[]>(`/api/recipes?${query.toString()}`)
  },

  getRecipe: (id: string): Promise<Recipe> =>
    request<Recipe>(`/api/recipes/${id}`),

  createRecipe: (data: RecipeInput): Promise<Recipe> =>
    request<Recipe>('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateRecipe: (id: string, data: RecipeInput): Promise<Recipe> =>
    request<Recipe>(`/api/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteRecipe: (id: string): Promise<void> =>
    request<void>(`/api/recipes/${id}`, { method: 'DELETE' }),

  toggleFavorite: (id: string): Promise<Recipe> =>
    request<Recipe>(`/api/recipes/${id}/favorite`, { method: 'PATCH' }),

  getCategories: (): Promise<Category[]> =>
    request<Category[]>('/api/categories'),

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('画像のアップロードに失敗しました')
    const data = await res.json()
    return data.imagePath as string
  },
}
