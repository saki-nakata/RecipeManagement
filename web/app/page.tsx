'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { apiClient } from '@/app/lib/apiClient'
import type { Recipe, Category } from '@/app/lib/types'
import RecipeCard from '@/app/components/RecipeCard'
import EmptyState from '@/app/components/EmptyState'

type SortOrder = 'newest' | 'oldest' | 'name' | 'cookTime'

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [initialLoading, setInitialLoading] = useState(true)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    apiClient.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchRecipes = useCallback(async () => {
    setFetching(true)
    try {
      const data = await apiClient.getRecipes({
        q: debouncedSearch || undefined,
        categoryId,
        favorite: favoriteOnly || undefined,
      })
      setRecipes(data)
    } finally {
      setFetching(false)
      setInitialLoading(false)
    }
  }, [debouncedSearch, categoryId, favoriteOnly])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const handleFavoriteToggle = async (id: number) => {
    await apiClient.toggleFavorite(String(id))
    fetchRecipes()
  }

  const sorted = [...recipes].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sortOrder === 'name') return a.title.localeCompare(b.title, 'ja')
    if (sortOrder === 'cookTime') return (a.cookTime ?? 999) - (b.cookTime ?? 999)
    return 0
  })

  const hasFilters = !!search || !!categoryId || favoriteOnly

  return (
    <main className="max-w-6xl mx-auto px-5 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold" style={{ color: '#2D2417' }}>レシピ一覧</h1>
        <p className="text-sm mt-0.5" style={{ color: '#7A6F5E' }}>おいしいレシピをみつけよう</p>
      </div>

      {/* フィルターバー */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B0A898' }} />
          <input
            type="text"
            placeholder="キーワードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white"
            style={{ border: '1px solid #E8E4DC', color: '#2D2417' }}
            onFocus={(e) => (e.target.style.borderColor = '#F97316')}
            onBlur={(e) => (e.target.style.borderColor = '#E8E4DC')}
          />
        </div>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-white"
          style={{ border: '1px solid #E8E4DC', color: '#2D2417' }}
        >
          <option value="">カテゴリ</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setFavoriteOnly(!favoriteOnly)}
          className="px-3 py-2 rounded-lg text-sm transition-colors"
          style={
            favoriteOnly
              ? { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }
              : { backgroundColor: '#fff', border: '1px solid #E8E4DC', color: '#7A6F5E' }
          }
        >
          ❤ お気に入り
        </button>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="px-3 py-2 rounded-lg text-sm focus:outline-none bg-white"
          style={{ border: '1px solid #E8E4DC', color: '#2D2417' }}
        >
          <option value="newest">新着順</option>
          <option value="oldest">古い順</option>
          <option value="name">名前順</option>
          <option value="cookTime">調理時間順</option>
        </select>
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#F97316' }} />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${fetching ? 'opacity-60' : 'opacity-100'}`}>
          {sorted.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </main>
  )
}
