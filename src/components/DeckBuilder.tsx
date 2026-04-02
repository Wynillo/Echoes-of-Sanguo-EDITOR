import { useState } from 'react'
import { useProjectStore } from '../stores/projectStore'

interface Props {
  value: number[]
  onChange: (ids: number[]) => void
  label?: string
}

export default function DeckBuilder({ value, onChange, label }: Props) {
  const [search, setSearch] = useState('')
  const { data } = useProjectStore()

  function getName(id: number) {
    return data.cardLocales.find((l) => l.id === id)?.name ?? `Card ${id}`
  }

  const available = data.cards
    .filter((c) => getName(c.id).toLowerCase().includes(search.toLowerCase()))
    .slice(0, 50)

  function add(id: number) {
    onChange([...value, id])
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div>
      {label && <div className="text-xs text-gray-400 mb-1">{label}</div>}
      <div className="flex gap-3">
        {/* Selected deck */}
        <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 min-h-20 max-h-48 overflow-y-auto">
          {value.map((id, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-0.5">
              <span>{getName(id)}</span>
              <button
                onClick={() => remove(i)}
                className="text-red-400 ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {/* Card picker */}
        <div className="w-40">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs mb-1"
          />
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-h-44 overflow-y-auto">
            {available.map((c) => (
              <button
                key={c.id}
                onClick={() => add(c.id)}
                className="w-full text-left px-2 py-1 text-xs hover:bg-gray-800 truncate"
              >
                {getName(c.id)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{value.length} cards in deck</div>
    </div>
  )
}
