'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Category } from '@/app/lib/types'
import { apiClient } from '@/app/lib/apiClient'

interface Ingredient {
  name: string
  amount: string
}

interface Props {
  mode: 'create' | 'edit'
  recipeId?: string
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

export default function RecipeForm({ mode, recipeId }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(10)
  const [description, setDescription] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }])
  const [instructions, setInstructions] = useState<string[]>([''])
  const [point, setPoint] = useState('')
  const [imagePath, setImagePath] = useState<string | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>()
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string | undefined>()

  useEffect(() => {
    apiClient.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !recipeId) return
    apiClient.getRecipe(recipeId)
      .then((recipe) => {
        setTitle(recipe.title)
        setCategoryId(recipe.categoryId)
        setDescription(recipe.description ?? '')
        setCookTime(recipe.cookTime ? String(recipe.cookTime) : '')
        setServings(recipe.servings ? String(recipe.servings) : '')
        setIngredients(parseIngredients(recipe.ingredients))
        setInstructions(parseInstructions(recipe.instructions))
        setPoint(recipe.point ?? '')
        setImagePath(recipe.imagePath)
        if (recipe.imagePath) setImagePreview(recipe.imagePath)
      })
      .catch(() => setLoadError('レシピの取得に失敗しました'))
  }, [mode, recipeId])

  const handleImageChange = async (file: File) => {
    setIsUploading(true)
    try {
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
      const path = await apiClient.uploadImage(file)
      setImagePath(path)
    } catch {
      alert('画像のアップロードに失敗しました')
      setImagePreview(undefined)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleImageChange(file)
  }

  const addIngredient = () =>
    setIngredients([...ingredients, { name: '', amount: '' }])

  const removeIngredient = (i: number) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i))

  const updateIngredient = (i: number, field: 'name' | 'amount', value: string) =>
    setIngredients(ingredients.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const addInstruction = () => setInstructions([...instructions, ''])

  const removeInstruction = (i: number) =>
    setInstructions(instructions.filter((_, idx) => idx !== i))

  const updateInstruction = (i: number, value: string) =>
    setInstructions(instructions.map((step, idx) => idx === i ? value : step))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'レシピ名を入力してください'
    const filledIngredients = ingredients.filter((i) => i.name.trim())
    if (filledIngredients.length === 0) errs.ingredients = '材料を1つ以上入力してください'
    const filledSteps = instructions.filter((s) => s.trim())
    if (filledSteps.length === 0) errs.instructions = '作り方を1つ以上入力してください'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const data = {
        title: title.trim(),
        categoryId,
        description: description.trim() || undefined,
        cookTime: cookTime ? Number(cookTime) : undefined,
        servings: servings ? Number(servings) : undefined,
        ingredients: JSON.stringify(ingredients.filter((i) => i.name.trim())),
        instructions: JSON.stringify(instructions.filter((s) => s.trim())),
        point: point.trim() || undefined,
        imagePath,
      }
      if (mode === 'create') {
        await apiClient.createRecipe(data)
        router.push('/?toast=created')
      } else {
        const updated = await apiClient.updateRecipe(recipeId!, data)
        router.push(`/recipes/${updated.id}?toast=updated`)
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelHref = mode === 'create' ? '/' : `/recipes/${recipeId}`

  if (loadError) {
    return <p className="p-8 text-red-600">{loadError}</p>
  }

  return (
    <main className="max-w-[860px] mx-auto px-5 py-7">
      {mode === 'edit' && (
        <button
          onClick={() => router.push(cancelHref)}
          className="mb-8 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold transition-all"
          style={{ backgroundColor: '#fff', border: '2px solid #FDBA74', color: '#7A6F5E', padding: '7px 18px' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#F97316'
            el.style.color = '#F97316'
            el.style.backgroundColor = '#FDF0E8'
            el.style.transform = 'translateX(-3px)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#FDBA74'
            el.style.color = '#7A6F5E'
            el.style.backgroundColor = '#fff'
            el.style.transform = 'translateX(0)'
          }}
        >
          ◀ 詳細に戻る
        </button>
      )}

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#2D2417' }}>
        {mode === 'create' ? '新しいレシピを登録' : 'レシピを編集'}
      </h1>
      <hr className="mb-6" style={{ borderColor: '#E8E4DC' }} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* レシピ名 */}
        <div>
          <label className="block text-sm font-medium text-[#2D2417] mb-1">
            レシピ名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例）鶏の唐揚げ"
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] ${errors.title ? 'border-red-400' : 'border-[#E8E4DC]'}`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">⚠ {errors.title}</p>}
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm font-medium text-[#2D2417] mb-1">
            カテゴリ（未選択時は「その他」を自動設定）
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {/* 画像 */}
        <div>
          <label className="block text-sm font-medium text-[#2D2417] mb-1">画像</label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="プレビュー" className="w-full h-48 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => { setImagePreview(undefined); setImagePath(undefined) }}
                className="absolute top-2 right-2 p-1 bg-white/85 rounded-full hover:bg-white"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-[#E8E4DC] rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              {isUploading ? (
                <p className="text-gray-500 text-sm">アップロード中...</p>
              ) : (
                <>
                  <p className="text-2xl mb-2">📷</p>
                  <p className="text-sm text-gray-500">クリックして画像を選択、またはドラッグ&ドロップ</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG / PNG / WebP / GIF、4MB以下</p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageChange(file)
            }}
          />
        </div>

        {/* 説明文 */}
        <div>
          <label className="block text-sm font-medium text-[#2D2417] mb-1">説明文</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このレシピの説明を入力してください..."
            rows={3}
            className="w-full px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
          />
        </div>

        {/* 調理時間・人数 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2417] mb-1">調理時間（分）</label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              min={1}
              placeholder="30"
              className="w-full px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2417] mb-1">何人前</label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              min={1}
              placeholder="2"
              className="w-full px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        {/* 材料 */}
        <div>
          <label className="block text-sm font-medium text-[#2D2417] mb-2">
            材料 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {ingredients.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                  placeholder="材料名（例：鶏もも肉）"
                  className="flex-1 px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <input
                  type="text"
                  value={item.amount}
                  onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                  placeholder="分量（例：500g）"
                  className="w-32 px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  disabled={ingredients.length === 1}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          {errors.ingredients && <p className="mt-1 text-xs text-red-500">⚠ {errors.ingredients}</p>}
          <button
            type="button"
            onClick={addIngredient}
            className="mt-2 flex items-center gap-1 text-sm text-[#F97316] hover:text-[#EA580C]"
          >
            <Plus size={14} /> 材料を追加
          </button>
        </div>

        {/* 作り方 */}
        <div>
          <label className="block text-sm font-medium text-[#2D2417] mb-2">
            作り方 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {instructions.map((step, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="mt-2 w-6 text-center text-sm font-medium text-gray-500 shrink-0">
                  {i + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  placeholder={`ステップ${i + 1}を入力...`}
                  rows={2}
                  className="flex-1 px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(i)}
                  disabled={instructions.length === 1}
                  className="mt-2 p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          {errors.instructions && <p className="mt-1 text-xs text-red-500">⚠ {errors.instructions}</p>}
          <button
            type="button"
            onClick={addInstruction}
            className="mt-2 flex items-center gap-1 text-sm text-[#F97316] hover:text-[#EA580C]"
          >
            <Plus size={14} /> ステップを追加
          </button>
        </div>

        {/* ポイント */}
        <div>
          <label className="block text-sm font-medium text-[#2D2417] mb-1">💡 ポイント・コツ</label>
          <textarea
            value={point}
            onChange={(e) => setPoint(e.target.value)}
            placeholder="おいしく作るポイントやコツを書いてみましょう"
            rows={3}
            className="w-full px-3 py-2 border border-[#E8E4DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
          />
        </div>

        <p className="text-xs text-gray-400">* は必須項目</p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(cancelHref)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ border: '1.5px solid #E8E4DC', color: '#7A6F5E' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#B0A898'
              el.style.backgroundColor = '#FAFAF8'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#E8E4DC'
              el.style.backgroundColor = ''
            }}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-5 py-2 rounded-lg text-white transition-colors text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#FB923C' }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = '#F97316')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = '#FB923C')}
          >
            {isSubmitting ? '送信中...' : mode === 'create' ? '登録する' : '更新する'}
          </button>
        </div>
      </form>
    </main>
  )
}
