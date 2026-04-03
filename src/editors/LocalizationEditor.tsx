import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import type { EditorCardLocale } from '../types/project'

export default function LocalizationEditor() {
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()
  const [search, setSearch] = useState('')

  const locales = data.cardLocales
  const filtered = locales.filter((l) =>
    search === '' || l.name.toLowerCase().includes(search.toLowerCase()) || String(l.id).includes(search)
  )

  function patchLocale(id: number, patch: Partial<EditorCardLocale>) {
    const next = locales.map((l) => l.id === id ? { ...l, ...patch } : l)
    setData('cardLocales', next)
    if (dirHandle) writeJsonFile(dirHandle, 'locales/en.json', next).catch(console.error)
  }

  const cellCls = 'bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500/50'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">Localization</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or ID..."
          className="ml-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm w-64" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
              <th className="pb-2 pr-4 w-12">ID</th>
              <th className="pb-2 pr-4 w-48">EN Name</th>
              <th className="pb-2">EN Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((locale) => (
              <tr key={locale.id} className="border-b border-gray-800">
                <td className="py-2 pr-4 text-gray-500">{locale.id}</td>
                <td className="py-2 pr-4">
                  <input
                    value={locale.name}
                    onChange={(e) => patchLocale(locale.id, { name: e.target.value })}
                    className={cellCls}
                  />
                </td>
                <td className="py-2">
                  <input
                    value={locale.description}
                    onChange={(e) => patchLocale(locale.id, { description: e.target.value })}
                    className={cellCls}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-gray-500 text-center py-8">{search ? 'No matches.' : 'No localization entries yet.'}</div>
        )}
      </div>
    </div>
  )
}
