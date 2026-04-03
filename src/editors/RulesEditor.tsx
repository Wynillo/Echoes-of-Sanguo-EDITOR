import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import type { EditorRules } from '../types/project'

const RULE_FIELDS: Array<{ key: keyof EditorRules; label: string; min: number }> = [
  { key: 'startingLP', label: 'Starting LP', min: 1 },
  { key: 'maxFieldZones', label: 'Max Field Zones', min: 1 },
  { key: 'deckSize', label: 'Deck Size', min: 1 },
  { key: 'cardCopyLimit', label: 'Card Copy Limit', min: 1 },
  { key: 'cardsDrawPerTurn', label: 'Cards Drawn Per Turn', min: 1 },
  { key: 'handLimit', label: 'Hand Limit', min: 1 },
]

export default function RulesEditor() {
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()
  const rules = data.rules

  function patch(update: Partial<EditorRules>) {
    const next = { ...rules, ...update }
    setData('rules', next)
    if (dirHandle) writeJsonFile(dirHandle, 'rules.json', next).catch(console.error)
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">Rules</span>
      </div>

      <div className="max-w-md">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col gap-4">
          {RULE_FIELDS.map(({ key, label, min }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <input
                type="number"
                min={min}
                value={rules[key]}
                onChange={(e) => patch({ [key]: parseInt(e.target.value) || min } as any)}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
