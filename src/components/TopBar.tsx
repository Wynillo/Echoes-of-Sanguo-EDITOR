import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSpinner, FaCheck, FaTriangleExclamation } from 'react-icons/fa6'
import { useProjectStore } from '@/stores/projectStore'
import { useValidation } from '@/components/ValidationBanner'
import { exportTcgToBlob, downloadBlob } from '@/fs/tcg'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function TopBar() {
  const { t } = useTranslation()
  const { data } = useProjectStore()
  const { hasErrors, errors, warnings } = useValidation()
  const [exporting, setExporting] = useState(false)

  const completeness = errors.length === 0 && warnings.length === 0
    ? 'complete'
    : errors.length === 0
      ? 'warnings'
      : 'errors'

  return (
    <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold leading-tight">{data.modInfo.name || 'Untitled MOD'}</h1>
            <p className="text-xs text-gray-400">
              v{data.modInfo.version} · {data.modInfo.author}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            completeness === 'complete' ? 'bg-green-900/50 text-green-400 border border-green-700/50' :
            completeness === 'warnings' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' :
            'bg-red-900/50 text-red-400 border border-red-700/50'
          }`}>
            {completeness === 'complete' ? <FaCheck size={10} /> : <FaTriangleExclamation size={10} />}
            {completeness === 'complete' ? 'Ready' : completeness === 'warnings' ? `${warnings.length} warnings` : `${errors.length} errors`}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
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
    </div>
  )
}
