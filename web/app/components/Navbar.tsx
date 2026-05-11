'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-40"
      style={{ backgroundColor: '#FFEDD5', borderBottom: '1px solid #FED7AA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="レシピ一覧へ">
          <span className="egg-icon text-xl">🍳</span>
          <span
            className="text-lg font-extrabold"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            レシピ管理アプリ
          </span>
        </Link>
        <Link
          href="/recipes/new"
          className="px-4 py-1.5 rounded-full font-medium text-sm transition-colors"
          style={{ backgroundColor: '#FDF0E8', color: '#C2410C', border: '1px solid #FDBA74' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.backgroundColor = '#FED7AA'
            el.style.borderColor = '#FB923C'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.backgroundColor = '#FDF0E8'
            el.style.borderColor = '#FDBA74'
          }}
        >
          ＋ レシピを追加
        </Link>
      </div>
    </header>
  )
}
