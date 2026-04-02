import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GiOpenBook, GiSpellBook, GiCardPick } from 'react-icons/gi'
import { readProjectFolder } from '@/fs/reader'
import { useProjectStore } from '@/stores/projectStore'

const RECENT_KEY = 'eos-editor-recent'

export default function StartScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const load = useProjectStore((s) => s.load)

  async function handleOpenFolder() {
    try {
      const dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
      const data = await readProjectFolder(dir)
      load(data, dir)
      navigate('/project')
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') console.error(e)
    }
  }

  async function handleNewProject() {
    const name = prompt(t('start.new') + ' — name:')
    if (!name) return
    const author = prompt('Author:') ?? ''
    try {
      const dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
      load({ modInfo: { id: name.toLowerCase().replace(/\s+/g, '-'), name, version: '1.0.0',
        author, type: 'expansion', description: '', minEngineVersion: '1.0.0', formatVersion: 2 } }, dir)
      navigate('/project')
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') console.error(e)
    }
  }

  async function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.tcg'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const { openTcgFile } = await import('@/fs/tcg')
        const { importTcgResult } = await import('@/fs/importer')
        const result = await openTcgFile(file)
        const dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
        await importTcgResult(result, dir)
        const data = await readProjectFolder(dir)
        load(data, dir)
        navigate('/project')
      } catch (e) {
        if ((e as DOMException).name !== 'AbortError') {
          alert(`Import failed: ${(e as Error).message}`)
        }
      }
    }
    input.click()
  }

  const recent: string[] = (() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') }
    catch { return [] }
  })()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">{t('app.title')}</h1>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={handleOpenFolder}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-4 rounded-xl text-lg transition-colors"
        >
          <GiOpenBook size={24} />
          {t('start.open')}
        </button>
        <button
          onClick={handleNewProject}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-4 rounded-xl text-lg transition-colors"
        >
          <GiSpellBook size={24} />
          {t('start.new')}
        </button>
        <button
          onClick={handleImport}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-4 rounded-xl text-lg transition-colors"
        >
          <GiCardPick size={24} />
          {t('start.import')}
        </button>
      </div>
      {recent.length > 0 && (
        <div className="text-sm text-gray-400">
          {t('start.recent')}: {recent.join(' · ')}
        </div>
      )}
    </div>
  )
}
