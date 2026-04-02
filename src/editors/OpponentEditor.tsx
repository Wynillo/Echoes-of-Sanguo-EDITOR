import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import DeckBuilder from '../components/DeckBuilder'
import type { EditorOpponent } from '../types/project'

const BEHAVIORS = ['default', 'smart', 'aggressive', 'defensive', 'cheating'] as const

export default function OpponentEditor() {
  const { id } = useParams<{ section: string; id: string }>()
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()

  const oppId = parseInt(id ?? '0', 10)
  const opp = data.opponents.find((o) => o.id === oppId) ?? {
    id: oppId, name: '', title: '', flavor: '',
    coinsWin: 100, coinsLoss: 0, deckIds: [], behavior: 'default',
  } as EditorOpponent

  function patch(update: Partial<EditorOpponent>) {
    const next = data.opponents.map((o) => o.id === oppId ? { ...o, ...update } : o)
    setData('opponents', next)
    if (dirHandle) writeJsonFile(dirHandle, 'opponents.json', next).catch(console.error)
  }

  function handleDelete() {
    if (!confirm('Delete this opponent?')) return
    setData('opponents', data.opponents.filter((o) => o.id !== oppId))
    navigate('/project/opponents')
  }

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'

  function field(label: string, element: React.ReactNode) {
    return (
      <div>
        <label className="text-xs text-gray-400 mb-1 block">{label}</label>
        {element}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project/opponents')} className="text-gray-400 hover:text-white text-sm">
          ← Opponents
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">{opp.name || `Opponent ${oppId}`}</span>
        <div className="ml-auto">
          <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg border border-red-800">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {field('Name', <input value={opp.name} onChange={(e) => patch({ name: e.target.value })} className={inputCls} />)}
          {field('Title', <input value={opp.title} onChange={(e) => patch({ title: e.target.value })} className={inputCls} />)}
          {field('Flavor Text', <textarea value={opp.flavor} onChange={(e) => patch({ flavor: e.target.value })} className={inputCls} rows={3} />)}
          {field('AI Behavior', (
            <select value={opp.behavior} onChange={(e) => patch({ behavior: e.target.value as any })} className={inputCls}>
              {BEHAVIORS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {field('Coins on Win', <input type="number" min={0} value={opp.coinsWin} onChange={(e) => patch({ coinsWin: parseInt(e.target.value) || 0 })} className={inputCls} />)}
            {field('Coins on Loss', <input type="number" min={0} value={opp.coinsLoss} onChange={(e) => patch({ coinsLoss: parseInt(e.target.value) || 0 })} className={inputCls} />)}
          </div>
        </div>

        <div>
          <DeckBuilder
            label="Opponent Deck"
            value={opp.deckIds}
            onChange={(ids) => patch({ deckIds: ids })}
          />
        </div>
      </div>
    </div>
  )
}
