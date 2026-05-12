'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Check } from 'lucide-react'

const MESSAGES: Record<string, { text: string; emoji: string }> = {
  created: { text: 'レシピを登録しました！', emoji: '🍳' },
  updated: { text: 'レシピを更新しました！', emoji: '✏️' },
  deleted: { text: 'レシピを削除しました！', emoji: '🗑️' },
}

export default function Toast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [toast, setToast] = useState<{ text: string; emoji: string } | null>(null)
  const [fading, setFading] = useState(false)
  const prevType = useRef<string | null>(null)

  useEffect(() => {
    const type = searchParams.get('toast')
    if (type && MESSAGES[type] && type !== prevType.current) {
      prevType.current = type
      setToast(MESSAGES[type])
      setFading(false)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('toast')
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname
      window.history.replaceState(null, '', newUrl)
    }
    if (!type) prevType.current = null
  }, [searchParams, router, pathname])

  useEffect(() => {
    if (!toast) return
    const fadeTimer = setTimeout(() => setFading(true), 2500)
    const hideTimer = setTimeout(() => setToast(null), 3000)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [toast])

  if (!toast) return null

  return (
    <div
      className="fixed top-20 left-0 right-0 z-50 flex items-center gap-3 px-6 py-4 shadow-lg text-white pointer-events-none mx-auto w-fit"
      style={{
        backgroundColor: '#16A34A',
        borderLeft: '5px solid #15803D',
        animation: fading
          ? 'toast-fade-out 0.5s ease-out forwards'
          : 'toast-slide-down 0.4s ease-out',
        minWidth: '240px',
      }}
    >
      <Check size={18} strokeWidth={3} className="shrink-0" />
      <span className="text-sm font-bold tracking-wide">{toast.text}</span>
    </div>
  )
}
