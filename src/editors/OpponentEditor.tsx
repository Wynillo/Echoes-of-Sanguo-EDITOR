import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../stores/projectStore'
import DeckBuilder from '../components/DeckBuilder'
import type { EditorOpponent } from '../types/project'
import { getOpponentField, setLocaleField, deleteLocaleKey } from '../utils/localeHelpers'

const BEHAVIORS = ['default', 'smart', 'aggressive', 'defensive', 'cheating'] as const

export default function OpponentEditor() {
  const { id } = useParams<{ section: string; id: string }>()
  const navigate = useNavigate()
  const { data, setData } = useProjectStore()
  const { i18n } = useTranslation()
  const lang = i18n.language

  const oppId = parseInt(id ?? '0', 10)
  const opp = data.opponents.find((o) => o.id === oppId) ?? {
    id: oppId, coinsWin: 100, coinsLoss: 0, deckIds: [], behavior: 'default',
  } as EditorOpponent

  const oppName = getOpponentField(data.locales, lang, oppId, 'name')
  const oppTitle = getOpponentField(data.locales, lang, oppId, 'title')
  const oppFlavor = getOpponentField(data.locales, lang, oppId, 'flavor')

  function patch(update: Partial<EditorOpponent>) {
    const next = data.opponents.map((o) => o.id === oppId ? { ...o, ...update } : o)
    setData('opponents', next)
  }

  function patchLocale(field: 'name' | 'title' | 'flavor', value: string) {
    const current = data.locales[lang]?.opponents[String(oppId)]
      ?? data.locales.en?.opponents[String(oppId)]
      ?? { name: '', title: '', flavor: '' }
    const updated = { ...current, [field]: value }
    setData('locales', setLocaleField(data.locales, lang, 'opponents', String(oppId), updated))
  }

  function handleDelete() {
    if (!confirm('Delete this opponent?')) return
    setData('opponents', data.opponents.filter((o) => o.id !== oppId))
    let nextLocales = data.locales
    for (const langKey of Object.keys(nextLocales)) {
      nextLocales = deleteLocaleKey(nextLocales, langKey, 'opponents', String(oppId))
    }
    setData('locales', nextLocales)
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
    <>
      <div className="flex items-center gap-3 mb-6">
        <span className="font-semibold">{oppName || `Opponent ${oppId}`}</span>
        <div className="ml-auto">
          <button onClick={handleDelete} className="cursor-pointer text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg border border-red-800 transition-colors">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {field('Name', <input value={oppName} onChange={(e) => patchLocale('name', e.target.value)} className={inputCls} />)}
          {field('Title', <input value={oppTitle} onChange={(e) => patchLocale('title', e.target.value)} className={inputCls} />)}
          {field('Flavor Text', <textarea value={oppFlavor} onChange={(e) => patchLocale('flavor', e.target.value)} className={inputCls} rows={3} />)}
          {field('AI Behavior', (
            <select value={opp.behavior} onChange={(e) => patch({ behavior: e.target.value as any })} className={inputCls}>
              {BEHAVIORS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {field('Coins on Win', <input type="number" min={0} value={opp.coinsWin} onChange={(e) => patch({ coinsWin: parseInt(e.target.value) || 0 })} className={inputCls} />)}
            {field('Coins on Loss', <input type="number" min={0} value={opp.coinsLoss} onChange={(e) => patch({ coinsLoss: parseInt(e.target.value) || 0 })} className={inputCls} />)}
          </div>
          {field('Currency', (
            <select value={opp.currencyId ?? ''} onChange={(e) => patch({ currencyId: e.target.value || undefined })} className={inputCls}>
              <option value="">— default (coins) —</option>
              {data.currencies.map((c) => <option key={c.id} value={c.id}>{c.id} ({c.icon})</option>)}
            </select>
          ))}
          {field('Unlock Condition', <input value={opp.unlockCondition ?? ''} onChange={(e) => patch({ unlockCondition: e.target.value || undefined })} className={inputCls} placeholder="optional" />)}
        </div>

        <div>
          <DeckBuilder
            label="Opponent Deck"
            value={opp.deckIds}
            onChange={(ids) => patch({ deckIds: ids })}
          />
        </div>
      </div>
    </>
  )
}
