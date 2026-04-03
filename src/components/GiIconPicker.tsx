import { useState } from 'react'
import * as GiIcons from 'react-icons/gi'

const ALL_ICON_NAMES = Object.keys(GiIcons) as Array<keyof typeof GiIcons>

interface Props {
  value?: string
  onSelect: (iconName: string) => void
  onClear: () => void
}

export default function GiIconPicker({ value, onSelect, onClear }: Props) {
  const [search, setSearch] = useState('')

  const filtered = ALL_ICON_NAMES
    .filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 80)

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-1">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons… e.g. dragon"
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white mb-2"
        autoFocus
      />
      <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
        {filtered.map((name) => {
          const Icon = GiIcons[name]
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => onSelect(name)}
              className={`flex items-center justify-center p-1.5 rounded hover:bg-gray-700 transition-colors ${
                value === name ? 'bg-indigo-700' : ''
              }`}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-xs text-red-400 hover:text-red-300"
        >
          Clear icon
        </button>
      )}
    </div>
  )
}
