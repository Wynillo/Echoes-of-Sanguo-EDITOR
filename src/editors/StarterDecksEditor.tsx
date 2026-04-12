import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaXmark } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import DeckBuilder from '../components/DeckBuilder'
import type { EditorStarterDeck } from '../types/project'

export default function StarterDecksEditor() {
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()
  const decks = data.starterDecks
  const [selectedIdx, setSelectedIdx] = useState<number>(0)

  function save(next: EditorStarterDeck[]) {
    setData('starterDecks', next)
    if (dirHandle) {
      // Save in MOD-base format
      const obj: Record<string, number[]> = {}
      for (const d of next) obj[String(d.raceId)] = d.cardIds
      writeJsonFile(dirHandle, 'starterDecks.json', obj).catch(console.error)
    }
  }

  function addDeck() {
    // Pick first race not already used
    const usedRaces = new Set(decks.map((d) => d.raceId))
    const availableRace = data.races.find((r) => !usedRaces.has(r.id))
    const next = [...decks, { raceId: availableRace?.id ?? 1, cardIds: [] }]
    save(next)
    setSelectedIdx(next.length - 1)
  }

  function patchDeck(idx: number, update: Partial<EditorStarterDeck>) {
    save(decks.map((d, i) => i === idx ? { ...d, ...update } : d))
  }

  function deleteDeck(idx: number) {
    if (!confirm('Delete this starter deck?')) return
    save(decks.filter((_, i) => i !== idx))
    if (selectedIdx >= decks.length - 1) setSelectedIdx(Math.max(0, decks.length - 2))
  }

  const selectedDeck = decks[selectedIdx]
  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">Starter Decks</span>
      </div>

      <div className="flex gap-6">
        {/* Deck list */}
        <div className="w-56 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Decks</span>
            <button onClick={addDeck} className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 transition-colors">+ Add</button>
          </div>
          <div className="flex flex-col gap-1">
            {decks.map((deck, i) => {
              const race = data.races.find((r) => r.id === deck.raceId)
              return (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer ${selectedIdx === i ? 'bg-indigo-900/50 border border-indigo-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  onClick={() => setSelectedIdx(i)}>
                  <span className="flex-1 text-sm truncate">{race?.emoji ?? ''} {race?.value ?? `Race ${deck.raceId}`}</span>
                  <span className="text-xs text-gray-500">{deck.cardIds.length} cards</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteDeck(i) }}
                    className="cursor-pointer text-red-400 text-xs hover:text-red-300 transition-opacity"><FaXmark size={10} /></button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Deck detail */}
        {selectedDeck && (
          <div className="flex-1">
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">Race</label>
              <select value={selectedDeck.raceId}
                onChange={(e) => patchDeck(selectedIdx, { raceId: parseInt(e.target.value) })}
                className={`${inputCls} w-64`}>
                {data.races.map((r) => <option key={r.id} value={r.id}>{r.emoji ?? ''} {r.value}</option>)}
              </select>
            </div>
            <DeckBuilder
              label="Starter Deck Cards"
              value={selectedDeck.cardIds}
              onChange={(ids) => patchDeck(selectedIdx, { cardIds: ids })}
            />
          </div>
        )}

        {decks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No starter decks yet. Click "+ Add" to create one per race.
          </div>
        )}
      </div>
    </div>
  )
}
