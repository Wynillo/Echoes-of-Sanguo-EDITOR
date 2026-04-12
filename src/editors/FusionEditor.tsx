import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaXmark } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import type { EditorFusionFormula, EditorRace } from '../types/project'
import QuickAddRace from '../components/QuickAddRace'

export default function FusionEditor() {
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()
  const formulas = data.fusion
  const races = data.races
  const [quickAddOpen, setQuickAddOpen] = useState<string | null>(null)

  function addRaceToStore(race: EditorRace, formulaId: string, operandIndex: 0 | 1) {
    const nextRaces = [...races, race]
    setData('races', nextRaces)
    if (dirHandle) writeJsonFile(dirHandle, 'races.json', nextRaces).catch(console.error)
    const formula = formulas.find((f) => f.id === formulaId)!
    const newOperands: [number, number] = [formula.operands[0], formula.operands[1]]
    newOperands[operandIndex] = race.id
    patch(formulaId, { operands: newOperands })
    setQuickAddOpen(null)
  }

  function save(next: EditorFusionFormula[]) {
    setData('fusion', next)
    if (dirHandle) writeJsonFile(dirHandle, 'fusion_formulas.json', next).catch(console.error)
  }

  function addFormula() {
    save([...formulas, {
      id: `formula-${Date.now()}`,
      operands: [1, 2],
      resultPool: [],
      priority: 1,
    }])
  }

  function patch(id: string, update: Partial<EditorFusionFormula>) {
    save(formulas.map((f) => f.id === id ? { ...f, ...update } : f))
  }

  function deleteFormula(id: string) {
    if (!confirm('Delete this formula?')) return
    save(formulas.filter((f) => f.id !== id))
  }

  const getName = (cardId: number) => data.locales.en?.cards[String(cardId)]?.name ?? `Card ${cardId}`

  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'
  const selCls = inputCls

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">Fusion Formulas</span>
        <button onClick={addFormula} className="cursor-pointer ml-auto bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm transition-colors">+ Add Formula</button>
      </div>

      <div className="flex flex-col gap-3">
        {formulas.map((f) => (
          <div key={f.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <div>
                  <div className="flex gap-1">
                    <select
                      value={f.operands[0]}
                      onChange={(e) => patch(f.id, { operands: [parseInt(e.target.value), f.operands[1]] })}
                      className={selCls}
                    >
                      {races.map((r) => (
                        <option key={r.id} value={r.id}>{r.value}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(quickAddOpen === `${f.id}-0` ? null : `${f.id}-0`)}
                      className="bg-gray-700 hover:bg-gray-600 px-2 rounded text-sm"
                    >+</button>
                  </div>
                  {quickAddOpen === `${f.id}-0` && (
                    <QuickAddRace
                      existingIds={races.map((r) => r.id)}
                      onAdd={(race) => addRaceToStore(race, f.id, 0)}
                      onCancel={() => setQuickAddOpen(null)}
                    />
                  )}
                </div>
                <span className="text-gray-400">+</span>
                <div>
                  <div className="flex gap-1">
                    <select
                      value={f.operands[1]}
                      onChange={(e) => patch(f.id, { operands: [f.operands[0], parseInt(e.target.value)] })}
                      className={selCls}
                    >
                      {races.map((r) => (
                        <option key={r.id} value={r.id}>{r.value}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(quickAddOpen === `${f.id}-1` ? null : `${f.id}-1`)}
                      className="bg-gray-700 hover:bg-gray-600 px-2 rounded text-sm"
                    >+</button>
                  </div>
                  {quickAddOpen === `${f.id}-1` && (
                    <QuickAddRace
                      existingIds={races.map((r) => r.id)}
                      onAdd={(race) => addRaceToStore(race, f.id, 1)}
                      onCancel={() => setQuickAddOpen(null)}
                    />
                  )}
                </div>
                <span className="text-gray-400">→</span>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Priority</label>
                  <input type="number" min={1} value={f.priority} onChange={(e) => patch(f.id, { priority: parseInt(e.target.value) || 1 })} className={`${inputCls} w-20`} />
                </div>
              </div>
              <button onClick={() => deleteFormula(f.id)} className="cursor-pointer text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded border border-red-800 transition-colors">Delete</button>
            </div>

            {/* Result pool — multi-select from cards */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Result Pool ({f.resultPool.length} cards)</label>
              <div className="flex flex-wrap gap-1 mb-2 min-h-8">
                {f.resultPool.map((cid, i) => (
                  <span key={i} className="bg-gray-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    {getName(cid)}
                    <button onClick={() => patch(f.id, { resultPool: f.resultPool.filter((_, j) => j !== i) })} className="cursor-pointer text-red-400 hover:text-red-300 transition-colors"><FaXmark size={8} /></button>
                  </span>
                ))}
              </div>
              <select onChange={(e) => {
                const id = parseInt(e.target.value)
                if (!isNaN(id) && !f.resultPool.includes(id)) patch(f.id, { resultPool: [...f.resultPool, id] })
                e.target.value = ''
              }} className={`${selCls} w-48`} defaultValue="">
                <option value="">Add card to pool…</option>
                {data.cards.map((c) => <option key={c.id} value={c.id}>{getName(c.id)}</option>)}
              </select>
            </div>
          </div>
        ))}
        {formulas.length === 0 && <div className="text-gray-500 text-center py-12">No fusion formulas yet.</div>}
      </div>
    </div>
  )
}
