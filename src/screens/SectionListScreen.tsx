import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa6'
import {
  GiCardPick, GiSwordman, GiScrollUnfurled, GiShop,
  GiChemicalDrop, GiScrollQuill, GiWorld, GiInfo, GiCardJoker, GiTwoCoins,
} from 'react-icons/gi'
import { useProjectStore } from '@/stores/projectStore'
import { useState } from 'react'

const CARD_TYPE_LABELS = ['All', 'Monster', 'Fusion', 'Spell', 'Trap', 'Equipment']

const SECTION_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  cards: GiCardPick,
  opponents: GiSwordman,
  campaign: GiScrollUnfurled,
  shop: GiShop,
  fusion: GiChemicalDrop,
  rules: GiScrollQuill,
  localization: GiWorld,
  modinfo: GiInfo,
  starterdecks: GiCardJoker,
  currencies: GiTwoCoins,
}

export default function SectionListScreen() {
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const data = useProjectStore((s) => s.data)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(0) // 0 = All

  function getItems(): unknown[] {
    if (section === 'modinfo') return []
    if (section === 'localization') return data.cards // Show cards in localization view
    if (section === 'starterdecks') return data.starterDecks
    if (section === 'currencies') return data.currencies
    return ((data as unknown as Record<string, unknown>)[section ?? ''] as unknown[]) ?? []
  }
  const items = getItems()

  function getLabel(item: Record<string, unknown>): string {
    if (section === 'cards' || section === 'localization') {
      return data.locales.en?.cards[String(item['id'])]?.name ?? `Card ${item['id']}`
    }
    if (section === 'opponents') {
      return data.locales.en?.opponents[String(item['id'])]?.name ?? `Opponent ${item['id']}`
    }
    if (section === 'campaign') return (item['title'] as string) ?? String(item['id'])
    if (section === 'shop') return (item['name'] as string) ?? String(item['id'])
    if (section === 'fusion') return String(item['id'])
    if (section === 'starterdecks') {
      const race = data.races.find(r => r.id === item['raceId'])
      return race?.value ?? `Race ${item['raceId']}`
    }
    if (section === 'currencies') return (item['id'] as string) ?? 'Currency'
    return String(item['id'] ?? item)
  }

  const filtered = (items as Record<string, unknown>[]).filter((item) => {
    if (search && !getLabel(item).toLowerCase().includes(search.toLowerCase())) return false
    if (section === 'cards' && typeFilter > 0 && item['type'] !== typeFilter) return false
    return true
  })

  const SectionIcon = SECTION_ICONS[section ?? ''] ?? GiCardPick

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/project')}
          className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5"
        >
          <FaArrowLeft size={12} /> {t(`section.${section}`)}
        </button>
        <div className="ml-auto flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.search')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
          <button
            onClick={() => navigate(`/project/${section}/new`)}
            className="cursor-pointer bg-violet-700 hover:bg-violet-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
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
              className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === i ? 'bg-violet-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
                  ? 'cursor-pointer bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 text-left text-sm transition-colors'
                  : 'cursor-pointer bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-left text-sm transition-colors'
              }
            >
              {section === 'cards' ? (
                <>
                  <div className="font-medium truncate text-xs">{getLabel(typedItem)}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-slate-500">{CARD_TYPE_LABELS[typedItem['type'] as number] ?? ''}</span>
                    <span className="text-xs text-slate-400">{typedItem['atk'] != null ? `ATK ${typedItem['atk']}` : ''}</span>
                  </div>
                </>
              ) : (
                <div className="font-medium truncate">{getLabel(typedItem)}</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <SectionIcon size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">
            {search ? 'No results match your search' : `No ${section} yet`}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {search ? 'Try a different search term' : 'Click "+ New" to add the first one'}
          </p>
        </div>
      )}
    </div>
  )
}
