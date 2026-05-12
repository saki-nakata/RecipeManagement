export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none" style={{ minHeight: '60vh' }}>
      <span className="text-8xl egg-icon">🍳</span>
      <div className="flex gap-2 items-center mt-2">
        <div className="loading-dot" style={{ width: '11px', height: '11px' }} />
        <div className="loading-dot" style={{ width: '11px', height: '11px' }} />
        <div className="loading-dot" style={{ width: '11px', height: '11px' }} />
      </div>
      <p className="text-sm font-medium tracking-widest" style={{ color: '#B0A898' }}>
        よみこみ中...
      </p>
    </div>
  )
}
