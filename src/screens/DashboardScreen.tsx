import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft, FaSpinner, FaCheck, FaTriangleExclamation } from 'react-icons/fa6'
import {
  GiCardPick, GiSwordman, GiScrollUnfurled, GiShop,
  GiChemicalDrop, GiScrollQuill, GiWorld, GiInfo, GiTwoCoins, GiCardJoker,
} from 'react-icons/gi'
import { useProjectStore } from '@/stores/projectStore'
import ValidationBanner, { useValidation } from '@/components/ValidationBanner'
import { exportTcgToBlob, downloadBlob } from '@/fs/tcg'

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
  const { hasErrors, errors, warnings } = useValidation()
  const [exporting, setExporting] = useState(false)

  const completeness = errors.length === 0 && warnings.length === 0
    ? 'complete'
    : errors.length === 0
      ? 'warnings'
      : 'errors'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">{data.modInfo.name || 'Untitled MOD'}</h1>
            <p className="text-sm text-gray-400">
              v{data.modInfo.version} · {data.modInfo.author}
            </p>
          </div>
          {/* Completeness indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            completeness === 'complete' ? 'bg-green-900/50 text-green-400 border border-green-700/50' :
            completeness === 'warnings' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' :
            'bg-red-900/50 text-red-400 border border-red-700/50'
          }`}>
            {completeness === 'complete' ? <FaCheck size={10} /> : <FaTriangleExclamation size={10} />}
            {completeness === 'complete' ? 'Ready' : completeness === 'warnings' ? `${warnings.length} warnings` : `${errors.length} errors`}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5"
          >
            <FaArrowLeft size={12} /> {t('nav.back')}
          </button>
          <button
            onClick={async () => {
              setExporting(true)
              try {
                const blob = await exportTcgToBlob(data)
                downloadBlob(blob, `${data.modInfo.id || 'mod'}.tcg`)
              } catch (e) {
                alert(t('export.error'))
                console.error(e)
              } finally {
                setExporting(false)
              }
            }}
            disabled={hasErrors || exporting}
            className="cursor-pointer flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            title={hasErrors ? 'Fix validation errors before exporting' : undefined}
          >
            {exporting && <FaSpinner size={12} className="animate-spin" />}
            {exporting ? 'Exporting…' : t('dashboard.export')}
          </button>
        </div>
      </div>

      <ValidationBanner />

      {/* Section grid */}
      <div className="grid grid-cols-4 gap-4 mt-6">
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
    </div>
  )
}
