import { useState, Suspense, lazy } from 'react'
import { useProjectStore } from '../stores/projectStore'
import type { EditorAttribute, EditorRace } from '../types/project'
import QuickAddAttribute from '../components/QuickAddAttribute'
import QuickAddRace from '../components/QuickAddRace'

const GiIconPicker = lazy(() => import('../components/GiIconPicker'))

export default function GameDataEditor() {
  const { data, setData } = useProjectStore()
  const { attributes, races } = data

  const [addingAttribute, setAddingAttribute] = useState(false)
  const [addingRace, setAddingRace] = useState(false)
  const [openIconPicker, setOpenIconPicker] = useState<number | null>(null)

  const inputCls = 'bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white'

  function saveAttributes(next: EditorAttribute[]) {
    setData('attributes', next)
  }

  function saveRaces(next: EditorRace[]) {
    setData('races', next)
  }

  function patchAttribute(id: number, patch: Partial<EditorAttribute>) {
    saveAttributes(attributes.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function patchRace(id: number, patch: Partial<EditorRace>) {
    saveRaces(races.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function deleteAttribute(id: number) {
    const used = data.cards.filter((c) => c.attribute === id || c.equipReqAttr === id)
    if (used.length > 0 && !confirm(`This attribute is used by ${used.length} card(s). Delete anyway?`)) return
    saveAttributes(attributes.filter((a) => a.id !== id))
  }

  function deleteRace(id: number) {
    const usedCards = data.cards.filter((c) => c.race === id || c.equipReqRace === id)
    const usedFusion = data.fusion.filter((f) => f.operands[0] === id || f.operands[1] === id)
    const total = usedCards.length + usedFusion.length
    if (total > 0 && !confirm(`This race is used in ${total} place(s). Delete anyway?`)) return
    saveRaces(races.filter((r) => r.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="font-semibold text-lg">Game Data</span>
      </div>

      {/* Attributes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Attributes</h2>
          <button
            onClick={() => setAddingAttribute(true)}
            className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded-lg text-sm"
          >
            + Add Attribute
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {attributes.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
            >
              <input
                type="color"
                value={a.color}
                onChange={(e) => patchAttribute(a.id, { color: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer flex-shrink-0"
              />
              <input
                value={a.symbol ?? ''}
                onChange={(e) => patchAttribute(a.id, { symbol: e.target.value || undefined })}
                placeholder="☀"
                maxLength={2}
                className={`${inputCls} w-10 text-center`}
                title="Symbol"
              />
              <input
                value={a.value}
                onChange={(e) => patchAttribute(a.id, { key: e.target.value, value: e.target.value })}
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={() => deleteAttribute(a.id)}
                className="text-red-400 hover:text-red-300 text-lg leading-none px-1"
              >
                ✕
              </button>
            </div>
          ))}

          {addingAttribute && (
            <QuickAddAttribute
              existingIds={attributes.map((a) => a.id)}
              onAdd={(attr) => { saveAttributes([...attributes, attr]); setAddingAttribute(false) }}
              onCancel={() => setAddingAttribute(false)}
            />
          )}
        </div>
      </div>

      {/* Races */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Races</h2>
          <button
            onClick={() => setAddingRace(true)}
            className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded-lg text-sm"
          >
            + Add Race
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {races.map((r) => (
            <div key={r.id} className="flex flex-col bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={r.color}
                  onChange={(e) => patchRace(r.id, { color: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer flex-shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setOpenIconPicker(openIconPicker === r.id ? null : r.id)}
                  className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs flex-shrink-0"
                >
                  {r.icon ? r.icon.slice(2, 12) + '…' : 'icon'}
                </button>
                <input
                  value={r.emoji ?? ''}
                  onChange={(e) => patchRace(r.id, { emoji: e.target.value || undefined })}
                  placeholder="🐲"
                  maxLength={2}
                  className={`${inputCls} w-10 text-center`}
                />
                <input
                  value={r.value}
                  onChange={(e) => patchRace(r.id, { key: e.target.value, value: e.target.value })}
                  className={`${inputCls} flex-1`}
                />
                <button
                  onClick={() => deleteRace(r.id)}
                  className="text-red-400 hover:text-red-300 text-lg leading-none px-1"
                >
                  ✕
                </button>
              </div>
              {openIconPicker === r.id && (
                <Suspense fallback={<div className="text-xs text-gray-400 p-2">Loading icons…</div>}>
                  <GiIconPicker
                    value={r.icon}
                    onSelect={(iconName) => { patchRace(r.id, { icon: iconName }); setOpenIconPicker(null) }}
                    onClear={() => patchRace(r.id, { icon: undefined })}
                  />
                </Suspense>
              )}
            </div>
          ))}

          {addingRace && (
            <QuickAddRace
              existingIds={races.map((r) => r.id)}
              onAdd={(race) => { saveRaces([...races, race]); setAddingRace(false) }}
              onCancel={() => setAddingRace(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
