import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  GiCardPick, GiSwordman, GiScrollUnfurled, GiShop,
  GiChemicalDrop, GiScrollQuill, GiWorld, GiInfo, GiCardJoker, GiTwoCoins,
} from 'react-icons/gi'
import { useProjectStore } from '@/stores/projectStore'

const SECTIONS = [
  { key: 'cards',        dataKey: 'cards',        icon: GiCardPick,       labelKey: 'section.cards',        color: 'text-amber-400' },
  { key: 'opponents',    dataKey: 'opponents',    icon: GiSwordman,        labelKey: 'section.opponents',    color: 'text-red-400' },
  { key: 'campaign',     dataKey: 'campaign',     icon: GiScrollUnfurled,  labelKey: 'section.campaign',     color: 'text-emerald-400' },
  { key: 'shop',         dataKey: 'shop',         icon: GiShop,            labelKey: 'section.shop',         color: 'text-yellow-400' },
  { key: 'fusion',       dataKey: 'fusion',       icon: GiChemicalDrop,    labelKey: 'section.fusion',       color: 'text-purple-400' },
  { key: 'starterdecks', dataKey: 'starterDecks', icon: GiCardJoker,       labelKey: 'section.starterdecks', color: 'text-cyan-400' },
  { key: 'currencies',   dataKey: 'currencies',   icon: GiTwoCoins,        labelKey: 'section.currencies',   color: 'text-orange-400' },
  { key: 'rules',        dataKey: 'rules',        icon: GiScrollQuill,     labelKey: 'section.rules',        color: 'text-blue-400' },
  { key: 'localization', dataKey: 'locales',      icon: GiWorld,           labelKey: 'section.localization', color: 'text-teal-400' },
  { key: 'modinfo',      dataKey: 'modInfo',      icon: GiInfo,            labelKey: 'section.modinfo',      color: 'text-slate-300' },
] as const

function sectionCount(data: Record<string, unknown>, key: string): number | null {
  const val = data[key]
  if (Array.isArray(val)) return val.length
  if (key === 'locales' && typeof val === 'object' && val !== null) return Object.keys(val).length
  return null
}

export default function DashboardScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useProjectStore()

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SECTIONS.map(({ key, dataKey, icon: Icon, labelKey, color }) => {
          const count = sectionCount(data as unknown as Record<string, unknown>, dataKey)
          return (
            <button
              key={key}
              onClick={() => navigate(key === 'rules' || key === 'modinfo' ? `/project/${key}/edit` : `/project/${key}`)}
              className="cursor-pointer bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-violet-700/50 rounded-xl p-5 text-left transition-all hover:shadow-md hover:shadow-violet-950/30"
            >
              <Icon size={32} className={`mb-3 ${color}`} />
              <div className="font-semibold">{t(labelKey)}</div>
              {count !== null && (
                <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
