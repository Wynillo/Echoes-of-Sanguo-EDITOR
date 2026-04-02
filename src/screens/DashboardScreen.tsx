import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  GiCardPick, GiSwordman, GiScrollUnfurled, GiShop,
  GiChemicalDrop, GiScrollQuill, GiWorld, GiInfo,
} from 'react-icons/gi'
import { useProjectStore } from '@/stores/projectStore'
import ValidationBanner from '@/components/ValidationBanner'

const SECTIONS = [
  { key: 'cards',        icon: GiCardPick,       labelKey: 'section.cards' },
  { key: 'opponents',    icon: GiSwordman,        labelKey: 'section.opponents' },
  { key: 'campaign',     icon: GiScrollUnfurled,  labelKey: 'section.campaign' },
  { key: 'shop',         icon: GiShop,            labelKey: 'section.shop' },
  { key: 'fusion',       icon: GiChemicalDrop,    labelKey: 'section.fusion' },
  { key: 'rules',        icon: GiScrollQuill,     labelKey: 'section.rules' },
  { key: 'localization', icon: GiWorld,           labelKey: 'section.localization' },
  { key: 'modinfo',      icon: GiInfo,            labelKey: 'section.modinfo' },
] as const

function sectionCount(data: Record<string, unknown>, key: string): number | null {
  const val = data[key]
  if (Array.isArray(val)) return val.length
  return null
}

export default function DashboardScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useProjectStore()

  function handleExport() {
    // Export wired in Task 22 after @wynillo/tcg-format is available
    alert('Export: install @wynillo/tcg-format first (see README)')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{data.modInfo.name || 'Untitled MOD'}</h1>
          <p className="text-sm text-gray-400">
            v{data.modInfo.version} · {data.modInfo.author}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            ← {t('nav.back')}
          </button>
          <button
            onClick={handleExport}
            className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {t('dashboard.export')}
          </button>
        </div>
      </div>

      <ValidationBanner />

      {/* Section grid */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {SECTIONS.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            onClick={() => navigate(`/project/${key}`)}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl p-5 text-left transition-colors"
          >
            <Icon size={32} className="mb-2 text-indigo-400" />
            <div className="font-semibold">{t(labelKey)}</div>
            {sectionCount(data as unknown as Record<string, unknown>, key) !== null && (
              <div className="text-sm text-gray-400">
                {sectionCount(data as unknown as Record<string, unknown>, key)} entries
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
