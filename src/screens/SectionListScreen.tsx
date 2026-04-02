import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/stores/projectStore'
import { useState } from 'react'

const CARD_TYPE_LABELS = ['All', 'Monster', 'Fusion', 'Spell', 'Trap', 'Equipment']

export default function SectionListScreen() {
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const data = useProjectStore((s) => s.data)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(0) // 0 = All

  const items: unknown[] = (data as unknown as Record<string, unknown>)[section === 'localization' ? 'cardLocales' : section === 'modinfo' ? [] as any : section ?? ''] as unknown[] ?? []
  const cardLocales = data.cardLocales

  function getLabel(item: Record<string, unknown>): string {
    if (section === 'cards' || section === 'localization') {
      return (cardLocales.find((l) => l.id === item['id'])?.name ?? `Card ${item['id']}`) as string
    }
    if (section === 'opponents') return (item['name'] as string) ?? `Opponent ${item['id']}`
    if (section === 'campaign') return (item['title'] as string) ?? String(item['id'])
    if (section === 'shop') return (item['name'] as string) ?? String(item['id'])
    if (section === 'fusion') return String(item['id'])
    return String(item['id'] ?? item)
  }

  const filtered = (items as Record<string, unknown>[]).filter((item) => {
    if (search && !getLabel(item).toLowerCase().includes(search.toLowerCase())) return false
    if (section === 'cards' && typeFilter > 0 && item['type'] !== typeFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="text-gray-400 hover:text-white text-sm">
          ← {t(`section.${section}`)}
        </button>
        <div className="ml-auto flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.search')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => navigate(`/project/${section}/new`)}
            className="bg-indigo-700 hover:bg-indigo-600 px-4 py-1.5 rounded-lg text-sm font-semibold"
          >
            + {t('list.new')}
          </button>
        </div>
      </div>

      {/* Card type filter tabs (cards section only) */}
      {section === 'cards' && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {CARD_TYPE_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setTypeFilter(i)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === i ? 'bg-indigo-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className={section === 'cards' ? 'grid grid-cols-5 gap-3' : 'flex flex-col gap-2'}>
        {filtered.map((item, idx) => {
          const typedItem = item as Record<string, unknown>
          const id = typedItem['id'] ?? idx
          return (
            <button
              key={String(id)}
              onClick={() => navigate(`/project/${section}/${id}`)}
              className={
                section === 'cards'
                  ? 'bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 text-left text-sm transition-colors'
                  : 'bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left text-sm transition-colors'
              }
            >
              <div className="font-medium truncate">{getLabel(typedItem)}</div>
              {section === 'cards' && (
                <div className="text-xs text-gray-400 mt-1">
                  ATK {String(typedItem['atk'] ?? '—')}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
