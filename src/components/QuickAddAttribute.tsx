import { useState } from 'react'
import type { EditorAttribute } from '../types/project'

interface Props {
  existingIds: number[]
  onAdd: (attr: EditorAttribute) => void
  onCancel: () => void
}

export default function QuickAddAttribute({ existingIds, onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [symbol, setSymbol] = useState('')

  function handleConfirm() {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
    onAdd({ id, key: trimmed, value: trimmed, color, symbol: symbol.trim() || undefined })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white'

  return (
    <div className="flex items-center gap-2 bg-gray-900 border border-dashed border-indigo-500 rounded-lg p-2 mt-1">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer flex-shrink-0"
        title="Color"
      />
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="☀"
        maxLength={2}
        className={`${inputCls} w-10 text-center`}
        title="Symbol"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Attribute name…"
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
  )
}
