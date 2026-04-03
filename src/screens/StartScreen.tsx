import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GiOpenBook, GiSpellBook, GiCardPick, GiScrollUnfurled } from 'react-icons/gi'
import { readProjectFolder } from '@/fs/reader'
import { useProjectStore } from '@/stores/projectStore'

const RECENT_KEY = 'eos-editor-recent'

export default function StartScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const load = useProjectStore((s) => s.load)

  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAuthor, setNewAuthor] = useState('')

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

  async function handleCreate() {
    if (!newName.trim()) return
    try {
      const dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
      load({ modInfo: { id: newName.toLowerCase().replace(/\s+/g, '-'), name: newName.trim(), version: '1.0.0',
        author: newAuthor.trim(), type: 'expansion', description: '', minEngineVersion: '1.0.0', formatVersion: 2 } }, dir)
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

  const inputCls = 'w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50'

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <GiScrollUnfurled size={64} className="text-violet-500" />
        <h1 className="text-4xl font-bold">{t('app.title')}</h1>
        <p className="text-slate-400 text-sm">MOD Editor for Echoes of Sanguo</p>
      </div>

      {/* Action cards */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={handleOpenFolder}
          className="cursor-pointer w-52 bg-slate-800/80 hover:bg-slate-700/80 border border-white/8 rounded-xl px-6 py-5 flex flex-col items-center gap-3 transition-all hover:border-white/16 hover:shadow-lg hover:shadow-violet-950/40"
        >
          <GiOpenBook size={32} className="text-violet-400" />
          <span className="text-sm font-medium">{t('start.open')}</span>
        </button>
        <button
          onClick={() => { setShowNewForm((v) => !v); setNewName(''); setNewAuthor('') }}
          className="cursor-pointer w-52 bg-slate-800/80 hover:bg-slate-700/80 border border-white/8 rounded-xl px-6 py-5 flex flex-col items-center gap-3 transition-all hover:border-white/16 hover:shadow-lg hover:shadow-violet-950/40"
        >
          <GiSpellBook size={32} className="text-cyan-400" />
          <span className="text-sm font-medium">{t('start.new')}</span>
        </button>
        <button
          onClick={handleImport}
          className="cursor-pointer w-52 bg-slate-800/80 hover:bg-slate-700/80 border border-white/8 rounded-xl px-6 py-5 flex flex-col items-center gap-3 transition-all hover:border-white/16 hover:shadow-lg hover:shadow-violet-950/40"
        >
          <GiCardPick size={32} className="text-slate-300" />
          <span className="text-sm font-medium">{t('start.import')}</span>
        </button>
      </div>

      {/* New project inline form */}
      {showNewForm && (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-96 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-300">New Project</h2>
          <input
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className={inputCls}
            autoFocus
          />
          <input
            placeholder="Author (optional)"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className={inputCls}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNewForm(false)}
              className="cursor-pointer text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Create & Choose Folder
            </button>
          </div>
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Recent</span>
          <div className="text-sm text-gray-400">{recent.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}
