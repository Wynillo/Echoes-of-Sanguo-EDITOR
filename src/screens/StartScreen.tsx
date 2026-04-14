import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GiOpenBook, GiSpellBook, GiCardPick, GiScrollUnfurled, GiTrashCan } from 'react-icons/gi'
import { FaFolderOpen, FaDownload, FaLink } from 'react-icons/fa6'
import { readProjectFolder } from '@/fs/reader'
import { useProjectStore } from '@/stores/projectStore'
import { listProjects, getProjectCount, getOldestProject } from '@/db/indexedDb'
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
  const [pendingAction, setPendingAction] = useState<'create' | 'import' | 'import-url' | null>(null)
  const [showUrlForm, setShowUrlForm] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [urlErrorDetails, setUrlErrorDetails] = useState<string | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [downloadingFileName, setDownloadingFileName] = useState<string | null>(null)

  useEffect(() => {
    loadSavedProjects()
  }, [])

  async function loadSavedProjects() {
    const projects = await listProjects()
    setSavedProjects(projects)
  }

  async function checkLimitAndProceed(action: 'create' | 'import' | 'import-url') {
    const count = await getProjectCount()
    if (count >= MAX_PROJECTS) {
      setPendingAction(action)
      setShowLimitConfirm(true)
    } else {
      if (action === 'create') doCreate()
      else if (action === 'import') doImport()
      else if (action === 'import-url') doImportFromUrl()
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
    else if (pendingAction === 'import-url') doImportFromUrl()
    setPendingAction(null)
    loadSavedProjects()
  }

  function doCreate() {
    if (!newName.trim()) return
    const projectId = newName.toLowerCase().replace(/\s+/g, '-')
    load({ modInfo: { id: projectId, name: newName.trim(), version: '1.0.0',
      author: newAuthor.trim(), type: 'expansion', description: '', minEngineVersion: '1.0.0', formatVersion: 2 } })
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
        load(data ?? {})
        navigate('/project')
      } catch (e) {
        alert(`Import failed: ${(e as Error).message}`)
      }
    }
    input.click()
  }

  async function doImportFromUrl() {
    const { validateReleaseUrl, loadTcgFromUrl } = await import('@/fs/tcg')
    const { importTcgResult } = await import('@/fs/importer')

    setUrlError(null)
    const validation = validateReleaseUrl(urlInput.trim())
    if (!validation.valid) {
      setUrlError(validation.error ?? 'Invalid URL')
      return
    }

    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const fileName = urlInput.trim().split('/').pop() ?? 'mod.tcg'
      setDownloadingFileName(fileName)

      const result = await loadTcgFromUrl(urlInput.trim(), (progress) => {
        setDownloadProgress(progress.percent)
      })

      const data = await importTcgResult(result, null)
      load(data ?? {})
      setIsDownloading(false)
      setDownloadProgress(0)
      setUrlInput('')
      setShowUrlForm(false)
      navigate('/project')
    } catch (e) {
      setIsDownloading(false)
      setDownloadProgress(0)
      console.error('=== URL IMPORT ERROR ===')
      console.error('Error type:', (e as Error).name)
      console.error('Error message:', (e as Error).message)
      console.error('Full stack trace:', (e as Error).stack)
      console.error('Error object:', e)
      console.error('========================')
      
      let errorMsg = (e as Error).message
      const errorStack = (e as Error).stack || ''
      const fullError = `${errorMsg}\n\nStack Trace:\n${errorStack}`
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('network') || errorMsg.includes('Failed to download')) {
        errorMsg = 'Failed to download. Check CORS or try a different URL.'
      } else if (errorMsg.includes('CORS')) {
        errorMsg = 'CORS error: This URL does not allow browser access.'
      }
      
      setUrlError(errorMsg)
      setUrlErrorDetails(fullError)
      setShowErrorDetails(false)
    }
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
      load(data)
      navigate('/project')
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') console.error(e)
    }
  }

  const inputCls = 'w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50'

  const handleUrlImportClick = () => {
    setShowUrlForm(true)
    setUrlInput('')
    setUrlError(null)
  }

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
        <button
          onClick={handleUrlImportClick}
          className="cursor-pointer w-52 bg-slate-800/80 hover:bg-slate-700/80 border border-white/8 rounded-xl px-6 py-5 flex flex-col items-center gap-3 transition-all hover:border-white/16 hover:shadow-lg hover:shadow-violet-950/40"
        >
          <FaLink size={32} className="text-emerald-400" />
          <span className="text-sm font-medium">Import from URL</span>
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

      {/* URL import dialog */}
      {showUrlForm && !isDownloading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-[32rem] flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FaLink className="text-emerald-400" />
              Import Mod from URL
            </h2>
            <p className="text-sm text-slate-400">
              Paste a GitHub release, GitHub raw, or GitLab release URL pointing to a .tcg file.
            </p>
            <input
              placeholder="https://github.com/user/repo/releases/latest/download/mod.tcg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && urlInput.trim()) {
                  checkLimitAndProceed('import-url')
                } else if (e.key === 'Escape') {
                  setShowUrlForm(false)
                  setUrlError(null)
                }
              }}
              className={inputCls}
              autoFocus
              disabled={isDownloading}
            />
            {urlError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg overflow-hidden">
                <div className="p-3 text-sm text-red-300">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex-1">{urlError}</span>
                    {urlErrorDetails && (
                      <button
                        onClick={() => setShowErrorDetails(!showErrorDetails)}
                        className="text-xs text-red-400 hover:text-red-200 underline flex-shrink-0"
                      >
                        {showErrorDetails ? 'Hide Details' : 'Show Details'}
                      </button>
                    )}
                  </div>
                  {showErrorDetails && urlErrorDetails && (
                    <div className="mt-2 pt-2 border-t border-red-500/30">
                      <p className="text-xs text-red-400 mb-1 font-semibold">Full Error Details:</p>
                      <pre className="bg-red-950/50 rounded p-2 text-xs text-red-300 whitespace-pre-wrap break-all font-mono max-h-60 overflow-y-auto">
                        {urlErrorDetails}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
              <p className="font-semibold mb-1">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>GitHub Releases: <code className="text-slate-300">github.com/.../releases/latest/download/*.tcg</code></li>
                <li>GitHub Raw: <code className="text-slate-300">raw.githubusercontent.com/.../*.tcg</code></li>
                <li>GitLab Releases: <code className="text-slate-300">gitlab.com/.../releases/.../downloads/*.tcg</code></li>
              </ul>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowUrlForm(false); setUrlError(null) }}
                className="cursor-pointer text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => checkLimitAndProceed('import-url')}
                disabled={!urlInput.trim()}
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download progress dialog */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-96 flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FaDownload className="text-emerald-400 animate-pulse" />
              Downloading Mod...
            </h2>
            {downloadingFileName && (
              <p className="text-sm text-slate-400 truncate">{downloadingFileName}</p>
            )}
            <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-right text-sm text-slate-400">{downloadProgress}%</p>
            <p className="text-xs text-slate-500 pt-2">
              {downloadProgress < 100 ? 'Please wait while the mod is being downloaded...' : 'Download complete!'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}