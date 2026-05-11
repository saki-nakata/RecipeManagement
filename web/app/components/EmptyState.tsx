import Link from 'next/link'

interface Props {
  hasFilters?: boolean
}

export default function EmptyState({ hasFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">🍽</div>
      {hasFilters ? (
        <p className="text-gray-500 text-lg">条件に一致するレシピが見つかりませんでした</p>
      ) : (
        <>
          <p className="text-gray-500 text-lg mb-4">まだレシピがありません</p>
          <Link
            href="/recipes/new"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            📝 レシピを追加する
          </Link>
        </>
      )}
    </div>
  )
}
