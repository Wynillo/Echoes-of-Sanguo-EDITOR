import { useProjectStore } from '../stores/projectStore'
import type { EditorCurrency } from '../types/project'

export default function CurrencyEditor() {
  const { data, setData } = useProjectStore()
  const currencies = data.currencies

  function save(next: EditorCurrency[]) {
    setData('currencies', next)
  }

  function addCurrency() {
    save([...currencies, {
      id: `currency-${Date.now()}`,
      nameKey: '',
      icon: '◈',
    }])
  }

  function patch(id: string, update: Partial<EditorCurrency>) {
    save(currencies.map((c) => c.id === id ? { ...c, ...update } : c))
  }

  function deleteCurrency(id: string) {
    if (!confirm('Delete this currency?')) return
    save(currencies.filter((c) => c.id !== id))
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <span className="font-semibold text-lg">Currencies</span>
        <button onClick={addCurrency} className="cursor-pointer ml-auto bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm transition-colors">+ Add Currency</button>
      </div>

      <div className="flex flex-col gap-3">
        {currencies.map((cur) => (
          <div key={cur.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ID</label>
                <input value={cur.id} onChange={(e) => {
                  const newId = e.target.value
                  const next = currencies.map((c) => c.id === cur.id ? { ...c, id: newId } : c)
                  save(next)
                }} className={`${inputCls} w-full`} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Name Key (locale)</label>
                <input value={cur.nameKey} onChange={(e) => patch(cur.id, { nameKey: e.target.value })}
                  className={`${inputCls} w-full`} placeholder="common.coins" />
                {cur.nameKey && data.locales.en?.common[cur.nameKey] && (
                  <div className="text-xs text-gray-500 mt-1">Preview: {data.locales.en.common[cur.nameKey]}</div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Icon</label>
                <input value={cur.icon} onChange={(e) => patch(cur.id, { icon: e.target.value })}
                  className={`${inputCls} w-full`} placeholder="◈" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Required Chapter</label>
                  <input type="number" min={1} value={cur.requiredChapter ?? ''} placeholder="—"
                    onChange={(e) => patch(cur.id, { requiredChapter: parseInt(e.target.value) || undefined })}
                    className={`${inputCls} w-full`} />
                </div>
                <button onClick={() => deleteCurrency(cur.id)}
                  className="cursor-pointer text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded border border-red-800 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {currencies.length === 0 && <div className="text-gray-500 text-center py-12">No currencies yet. Click "+ Add Currency" to create one.</div>}
      </div>
    </>
  )
}
