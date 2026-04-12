import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import DeckBuilder from '../components/DeckBuilder'
import type { EditorShopPack } from '../types/project'

export default function ShopEditor() {
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()
  const packs = data.shop

  function save(next: EditorShopPack[]) {
    setData('shop', next)
    if (dirHandle) writeJsonFile(dirHandle, 'shop.json', { packs: next, currencies: data.currencies }).catch(console.error)
  }

  function addPack() {
    save([...packs, {
      id: `pack-${Date.now()}`,
      name: 'New Pack',
      cost: 100,
      drawCount: 5,
      cardPool: [],
    }])
  }

  function patch(id: string, update: Partial<EditorShopPack>) {
    save(packs.map((p) => p.id === id ? { ...p, ...update } : p))
  }

  function deletePack(id: string) {
    if (!confirm('Delete this pack?')) return
    save(packs.filter((p) => p.id !== id))
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">Shop</span>
        <button onClick={addPack} className="cursor-pointer ml-auto bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm transition-colors">+ Add Pack</button>
      </div>

      <div className="flex flex-col gap-4">
        {packs.map((pack) => (
          <div key={pack.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <input value={pack.name} onChange={(e) => patch(pack.id, { name: e.target.value })}
                className={`${inputCls} text-base font-semibold flex-1`} placeholder="Pack name" />
              <button onClick={() => deletePack(pack.id)} className="cursor-pointer text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded border border-red-800 transition-colors">Delete</button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Cost</label>
                <input type="number" min={0} value={pack.cost} onChange={(e) => patch(pack.id, { cost: parseInt(e.target.value) || 0 })} className={`${inputCls} w-full`} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Draw Count</label>
                <input type="number" min={1} value={pack.drawCount} onChange={(e) => patch(pack.id, { drawCount: parseInt(e.target.value) || 1 })} className={`${inputCls} w-full`} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Currency</label>
                <select value={pack.currencyId ?? ''} onChange={(e) => patch(pack.id, { currencyId: e.target.value || undefined })} className={`${inputCls} w-full`}>
                  <option value="">— default —</option>
                  {data.currencies.map((c) => <option key={c.id} value={c.id}>{c.id} ({c.icon})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Unlock Condition</label>
                <input value={pack.unlockCondition ?? ''} onChange={(e) => patch(pack.id, { unlockCondition: e.target.value || undefined })} className={`${inputCls} w-full`} placeholder="optional" />
              </div>
            </div>
            <DeckBuilder label="Card Pool" value={pack.cardPool} onChange={(ids) => patch(pack.id, { cardPool: ids })} />
          </div>
        ))}
        {packs.length === 0 && <div className="text-gray-500 text-center py-12">No packs yet.</div>}
      </div>
    </div>
  )
}
