'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Recipe } from '@/app/lib/types'
import { CATEGORY_COLORS } from '@/app/lib/categoryColors'

interface Props {
  recipe: Recipe
  onFavoriteToggle: (id: number) => void
}

export default function RecipeCard({ recipe, onFavoriteToggle }: Props) {
  const router = useRouter()
  const colors = CATEGORY_COLORS[recipe.categoryId] ?? CATEGORY_COLORS[10]

  return (
    <div
      className="bg-white overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1"
      style={{
        borderRadius: '12px',
        border: '1px solid #E8E4DC',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.13)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
      }}
      onClick={() => router.push(`/recipes/${recipe.id}`)}
    >
      <div className="relative h-48">
        {recipe.imagePath ? (
          <img
            src={recipe.imagePath}
            alt={recipe.title}
            className="w-full h-full object-contain"
            style={{ backgroundColor: '#F9FAFB' }}
          />
        ) : (
          <div
            className="h-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: colors.bg }}
          >
            {recipe.category.icon}
          </div>
        )}
        <button
          className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-50"
          style={{ width: '36px', height: '36px', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle(recipe.id)
          }}
          aria-label="お気に入り"
        >
          <Heart
            size={18}
            className={recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-base line-clamp-2 mb-1.5" style={{ color: '#2D2417' }}>
          {recipe.title}
        </h3>
        <span
          className="inline-block text-xs px-2 py-0.5 rounded-full mb-1"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {recipe.category.icon} {recipe.category.name}
        </span>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs space-x-2" style={{ color: '#7A6F5E' }}>
            {recipe.cookTime && <span>⏱ {recipe.cookTime}分</span>}
            {recipe.servings && <span>👥 {recipe.servings}人前</span>}
          </p>
          <p className="text-xs" style={{ color: '#B0A898' }}>
            更新日: {new Date(recipe.updatedAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>
    </div>
  )
}
