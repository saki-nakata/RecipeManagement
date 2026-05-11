'use client'

interface Props {
  recipeName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function DeleteModal({ recipeName, onConfirm, onCancel, isDeleting }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#2D2417' }}>レシピを削除</h2>
        <p className="mb-1" style={{ color: '#7A6F5E' }}>「{recipeName}」を削除します。</p>
        <p className="text-sm mb-6" style={{ color: '#B0A898' }}>この操作は取り消せません。</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{ border: '1px solid #E8E4DC', color: '#7A6F5E' }}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  )
}
