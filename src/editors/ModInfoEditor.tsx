import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import type { EditorModInfo } from '../types/project'

const MOD_TYPES = ['base', 'expansion', 'cosmetic']

export default function ModInfoEditor() {
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()
  const modInfo = data.modInfo

  function patch(update: Partial<EditorModInfo>) {
    const next = { ...modInfo, ...update }
    setData('modInfo', next)
    if (dirHandle) {
      const { formatVersion, name, author, ...mod } = next
      writeJsonFile(dirHandle, 'mod.json', mod).catch(console.error)
      writeJsonFile(dirHandle, 'manifest.json', { formatVersion, name, author }).catch(console.error)
    }
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full'

  function field(label: string, element: React.ReactNode) {
    return (
      <div>
        <label className="text-xs text-gray-400 mb-1 block">{label}</label>
        {element}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">MOD Info</span>
      </div>

      <div className="max-w-lg">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col gap-4">
          {field('MOD ID', <input value={modInfo.id} onChange={(e) => patch({ id: e.target.value })} className={inputCls} placeholder="my-mod-id" />)}
          {field('Name', <input value={modInfo.name} onChange={(e) => patch({ name: e.target.value })} className={inputCls} />)}
          {field('Version', <input value={modInfo.version} onChange={(e) => patch({ version: e.target.value })} className={inputCls} placeholder="1.0.0" />)}
          {field('Author', <input value={modInfo.author} onChange={(e) => patch({ author: e.target.value })} className={inputCls} />)}
          {field('Type', (
            <select value={modInfo.type} onChange={(e) => patch({ type: e.target.value })} className={inputCls}>
              {MOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ))}
          {field('Description', <textarea value={modInfo.description} onChange={(e) => patch({ description: e.target.value })} className={inputCls} rows={3} />)}
          {field('Min Engine Version', <input value={modInfo.minEngineVersion} onChange={(e) => patch({ minEngineVersion: e.target.value })} className={inputCls} placeholder="1.0.0" />)}
          {field('Format Version', (
            <input type="number" min={1} value={modInfo.formatVersion}
              onChange={(e) => patch({ formatVersion: parseInt(e.target.value) || 1 })} className={inputCls} />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Changes are saved to mod.json and manifest.json in your project folder.</p>
      </div>
    </div>
  )
}
