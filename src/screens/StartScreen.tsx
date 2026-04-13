import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GiOpenBook, GiSpellBook, GiCardPick, GiScrollUnfurled, GiTrashCan } from 'react-icons/gi'
import { FaFolderOpen } from 'react-icons/fa6'
import { readProjectFolder } from '@/fs/reader'
import { useProjectStore } from '@/stores/projectStore'
import { listProjects, deleteProject, getProjectCount, getOldestProject } from '@/db/indexedDb'
import type { ProjectMeta } from '@/db/indexedDb'

const MAX_PROJECTS = 3

export default function StartScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const load = useProjectStore((s) => s.load)
  const loadFromIndexedDB = useProjectStore((s) => s.loadFromIndexedDB)
  const deleteFromIndexedDB = useProjectStore((s) => s.deleteFromIndexedDB)

  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [savedProjects, setSavedProjects] = useState<ProjectMeta[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showLimitConfirm, setShowLimitConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<'create' | 'import' | null>(null)

  useEffect(() => {
    loadSavedProjects()
  }, [])

  async function loadSavedProjects() {
    const projects = await listProjects()
    setSavedProjects(projects)
  }

  async function checkLimitAndProceed(action: 'create' | 'import') {
    const count = await getProjectCount()
    if (count >= MAX_PROJECTS) {
      setPendingAction(action)
      setShowLimitConfirm(true)
    } else {
      if (action === 'create') doCreate()
      else doImport()
    }
  }

  async function handleLimitConfirm() {
    const oldest = await getOldestProject()
    if (oldest) {
      await deleteFromIndexedDB(oldest.id)
    }
    setShowLimitConfirm(false)
    if (pendingAction === 'create') doCreate()
    else if (pendingAction === 'import') doImport()
    setPendingAction(null)
    loadSavedProjects()
  }

  function doCreate() {
    if (!newName.trim()) return
    const projectId = newName.toLowerCase().replace(/\s+/g, '-')
    load({ modInfo: { id: projectId, name: newName.trim(), version: '1.0.0',
      author: newAuthor.trim(), type: 'expansion', description: '', minEngineVersion: '1.0.0', formatVersion: 2 } }, null, projectId)
    setShowNewForm(false)
    navigate('/project')
  }

  async function doImport() {
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
        const data = await importTcgResult(result, null)
        const projectId = data?.modInfo?.id ?? `import-${Date.now()}`
        load(data ?? {}, null, projectId)
        navigate('/project')
      } catch (e) {
        alert(`Import failed: ${(e as Error).message}`)
      }
    }
    input.click()
  }

  async function handleLoadProject(id: string) {
    await loadFromIndexedDB(id)
    navigate('/project')
  }

  async function handleDeleteProject(id: string) {
    await deleteFromIndexedDB(id)
    setShowDeleteConfirm(null)
    loadSavedProjects()
  }

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
          onClick={() => checkLimitAndProceed('import')}
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
            onKeyDown={(e) => e.key === 'Enter' && checkLimitAndProceed('create')}
            className={inputCls}
            autoFocus
          />
          <input
            placeholder="Author (optional)"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkLimitAndProceed('create')}
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
              onClick={() => checkLimitAndProceed('create')}
              disabled={!newName.trim()}
              className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Saved projects */}
      {savedProjects.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Saved Projects</span>
          <div className="flex gap-3 flex-wrap justify-center">
            {savedProjects.map((p) => (
              <div key={p.id} className="group relative bg-slate-800/80 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-white/16 transition-all">
                <button
                  onClick={() => handleLoadProject(p.id)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <FaFolderOpen size={18} className="text-amber-400" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-slate-500">Last edited: {new Date(p.savedAt).toLocaleDateString()}</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(p.id)}
                  className="cursor-pointer p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <GiTrashCan size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limit confirmation dialog */}
      {showLimitConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-96 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Project Limit Reached</h2>
            <p className="text-sm text-slate-400">
              You have {MAX_PROJECTS} saved projects. Creating a new one will delete the oldest project. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowLimitConfirm(false); setPendingAction(null) }}
                className="cursor-pointer text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLimitConfirm}
                className="cursor-pointer bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Delete & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-96 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Delete Project?</h2>
            <p className="text-sm text-slate-400">
              Are you sure you want to delete this project? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="cursor-pointer text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                className="cursor-pointer bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}