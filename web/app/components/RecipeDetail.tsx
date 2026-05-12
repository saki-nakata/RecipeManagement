'use client'

import { useState, useEffect } from 'react'
import { Heart, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Recipe } from '@/app/lib/types'
import { apiClient } from '@/app/lib/apiClient'
import { CATEGORY_COLORS } from '@/app/lib/categoryColors'
import DeleteModal from '@/app/components/DeleteModal'
import LoadingSpinner from '@/app/components/LoadingSpinner'

interface Ingredient {
  name: string
  amount: string
}

function parseIngredients(raw: string): Ingredient[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Ingredient[]
  } catch {
    // fallback for plain-text format
  }
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const lastSpace = line.lastIndexOf(' ')
      if (lastSpace > 0) {
        return { name: line.slice(0, lastSpace), amount: line.slice(lastSpace + 1) }
      }
      return { name: line, amount: '' }
    })
}

function parseInstructions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as string[]
  } catch {
    // fallback
  }
  return raw.split('\n').filter(Boolean)
}

interface Props {
  id: string
}

export default function RecipeDetail({ id }: Props) {
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  useEffect(() => {
    apiClient
      .getRecipe(id)
      .then(setRecipe)
      .catch(() => setError('レシピが見つかりませんでした'))
      .finally(() => setLoading(false))
  }, [id])

  const handleFavoriteToggle = async () => {
    if (!recipe || isFavoriteLoading) return
    setIsFavoriteLoading(true)
    try {
      const updated = await apiClient.toggleFavorite(String(recipe.id))
      setRecipe(updated)
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!recipe) return
    setIsDeleting(true)
    try {
      await apiClient.deleteRecipe(String(recipe.id))
      router.push('/?toast=deleted')
    } catch {
      alert('削除に失敗しました')
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !recipe) {
    return <p className="p-8 text-red-600">{error ?? 'エラーが発生しました'}</p>
  }

  const colors = CATEGORY_COLORS[recipe.categoryId] ?? CATEGORY_COLORS[10]
  const ingredientList = parseIngredients(recipe.ingredients)
  const instructionList = parseInstructions(recipe.instructions)

  return (
    <main className="max-w-[1200px] mx-auto px-5 py-7">
      {/* 画像 */}
      {recipe.imagePath ? (
        <img
          src={recipe.imagePath}
          alt={recipe.title}
          className="w-full object-cover mb-6"
          style={{ maxHeight: '380px', borderRadius: '12px' }}
        />
      ) : (
        <div
          className="w-full mb-6 flex items-center justify-center text-7xl"
          style={{ height: '220px', backgroundColor: colors.bg, borderRadius: '12px' }}
        >
          {recipe.category.icon}
        </div>
      )}

      {/* タイトル・アクション */}
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <h1 className="flex-1 font-bold" style={{ fontSize: '1.6rem', color: '#2D2417', lineHeight: '1.3' }}>
          {recipe.title}
        </h1>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleFavoriteToggle}
            disabled={isFavoriteLoading}
            className="flex items-center gap-1.5 text-sm font-medium transition-all disabled:opacity-50"
            style={recipe.isFavorite
              ? { backgroundColor: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', padding: '8px 14px', borderRadius: '8px' }
              : { backgroundColor: 'transparent', color: '#7A6F5E', border: '1.5px solid #FDBA74', padding: '8px 14px', borderRadius: '8px' }
            }
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = '#FEF2F2'
              el.style.color = '#DC2626'
              el.style.borderColor = '#FECACA'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              if (recipe.isFavorite) return
              el.style.backgroundColor = 'transparent'
              el.style.color = '#7A6F5E'
              el.style.borderColor = '#FDBA74'
            }}
          >
            <Heart size={16} className={recipe.isFavorite ? 'fill-red-500 text-red-500' : ''} />
            お気に入り
          </button>
          <button
            onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
            className="flex items-center gap-1.5 text-sm font-medium transition-all"
            style={{ backgroundColor: 'transparent', color: '#7A6F5E', border: '1.5px solid #FDBA74', padding: '8px 14px', borderRadius: '8px' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = '#FDF0E8'
              el.style.color = '#EA580C'
              el.style.borderColor = '#F97316'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = 'transparent'
              el.style.color = '#7A6F5E'
              el.style.borderColor = '#FDBA74'
            }}
          >
            <Pencil size={16} />
            編集
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 text-sm font-medium transition-all"
            style={{ backgroundColor: 'transparent', color: '#7A6F5E', border: '1.5px solid #FDBA74', padding: '8px 14px', borderRadius: '8px' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = '#FEF2F2'
              el.style.color = '#DC2626'
              el.style.borderColor = '#FECACA'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.backgroundColor = 'transparent'
              el.style.color = '#7A6F5E'
              el.style.borderColor = '#FDBA74'
            }}
          >
            <Trash2 size={16} />
            削除
          </button>
        </div>
      </div>

      {/* メタ情報 */}
      <div
        className="flex items-center gap-3 flex-wrap mb-7"
        style={{ paddingBottom: '20px', borderBottom: '1.5px solid #E8E4DC' }}
      >
        <span
          className="inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {recipe.category.icon} {recipe.category.name}
        </span>
        {recipe.cookTime && (
          <span className="text-sm" style={{ color: '#7A6F5E' }}>⏱ {recipe.cookTime}分</span>
        )}
        {recipe.servings && (
          <span className="text-sm" style={{ color: '#7A6F5E' }}>👥 {recipe.servings}人前</span>
        )}
        <span className="text-sm ml-auto" style={{ color: '#B0A898' }}>
          更新日: {new Date(recipe.updatedAt).toLocaleDateString('ja-JP')}
        </span>
      </div>

      {/* 説明 */}
      {recipe.description && (
        <section className="mb-8">
          <h2
            className="text-base font-bold mb-3.5 pb-2"
            style={{ color: '#2D2417', borderBottom: '2px solid #FDF0E8' }}
          >
            📝 説明
          </h2>
          <p className="leading-relaxed whitespace-pre-wrap" style={{ fontSize: '0.95rem', color: '#7A6F5E' }}>
            {recipe.description}
          </p>
        </section>
      )}

      {/* 材料 */}
      <section className="mb-8">
        <h2
          className="text-base font-bold mb-3.5 pb-2"
          style={{ color: '#2D2417', borderBottom: '2px solid #FDF0E8' }}
        >
          🥕 材料
        </h2>
        <ul className="flex flex-col gap-1.5">
          {ingredientList.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
              style={{ backgroundColor: '#FDF0E8', fontSize: '0.95rem', color: '#2D2417' }}
            >
              <span className="shrink-0" style={{ color: '#F97316', fontSize: '0.5rem' }}>●</span>
              <span>{item.name}</span>
              {item.amount && (
                <span style={{ color: '#7A6F5E' }}>　{item.amount}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* 作り方 */}
      <section className="mb-8">
        <h2
          className="text-base font-bold mb-3.5 pb-2"
          style={{ color: '#2D2417', borderBottom: '2px solid #FDF0E8' }}
        >
          👨‍🍳 作り方
        </h2>
        <ol className="flex flex-col gap-3.5">
          {instructionList.map((step, i) => (
            <li key={i} className="flex gap-3.5 items-start" style={{ color: '#7A6F5E', lineHeight: '1.65', fontSize: '0.95rem' }}>
              <span
                className="shrink-0 flex items-center justify-center rounded-full font-bold"
                style={{ minWidth: '28px', height: '28px', backgroundColor: '#FED7AA', fontSize: '0.8rem', marginTop: '2px', color: '#EA580C' }}
              >
                {i + 1}
              </span>
              <span className="whitespace-pre-wrap">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ポイント */}
      {recipe.point && (
        <section className="mb-8">
          <h2
            className="text-base font-bold mb-3.5 pb-2"
            style={{ color: '#2D2417', borderBottom: '2px solid #FDF0E8' }}
          >
            💡 ポイント・コツ
          </h2>
          <div
            className="leading-relaxed whitespace-pre-wrap"
            style={{ backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '10px', padding: '14px 16px', color: '#2D2417', fontSize: '0.95rem' }}
          >
            {recipe.point}
          </div>
        </section>
      )}

      {showDeleteModal && (
        <DeleteModal
          recipeName={recipe.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </main>
  )
}
