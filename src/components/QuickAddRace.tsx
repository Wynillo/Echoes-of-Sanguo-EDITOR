import { useState, Suspense, lazy } from 'react'
import type { EditorRace } from '../types/project'

const GiIconPicker = lazy(() => import('./GiIconPicker'))

interface Props {
  existingIds: number[]
  onAdd: (race: EditorRace) => void
  onCancel: () => void
}

export default function QuickAddRace({ existingIds, onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [icon, setIcon] = useState<string | undefined>()
  const [emoji, setEmoji] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  function handleConfirm() {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
    onAdd({ id, key: trimmed, value: trimmed, color, icon, emoji: emoji.trim() || undefined })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white'

  return (
    <div className="bg-gray-900 border border-dashed border-indigo-500 rounded-lg p-2 mt-1">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer flex-shrink-0"
          title="Color"
        />
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs flex-shrink-0"
          title="Pick icon"
        >
          {icon ? icon.slice(2, 12) + '…' : '🎮 icon'}
        </button>
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🐲"
          maxLength={2}
          className={`${inputCls} w-10 text-center`}
          title="Emoji"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Race name…"
          className={`${inputCls} flex-1`}
          autoFocus
        />
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-indigo-700 hover:bg-indigo-600 px-2 py-1 rounded text-sm"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-white px-1 text-sm"
        >
          ✕
        </button>
      </div>
      {showPicker && (
        <Suspense fallback={<div className="text-xs text-gray-400 mt-2 p-2">Loading icons…</div>}>
          <GiIconPicker
            value={icon}
            onSelect={(iconName) => { setIcon(iconName); setShowPicker(false) }}
            onClear={() => setIcon(undefined)}
          />
        </Suspense>
      )}
    </div>
  )
}
