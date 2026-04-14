import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaXmark, FaUpload } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { createEmptyLocaleData, getLanguages } from '../utils/localeHelpers'
import type { LocaleData } from '../types/project'
import LocaleImporter from '../components/LocaleImporter'

type Domain = 'cards' | 'opponents' | 'shop' | 'campaign' | 'common'

const DOMAIN_TABS: { key: Domain; label: string }[] = [
  { key: 'cards', label: 'Cards' },
  { key: 'opponents', label: 'Opponents' },
  { key: 'shop', label: 'Shop' },
  { key: 'campaign', label: 'Campaign' },
  { key: 'common', label: 'Common' },
]

export default function LocalizationEditor() {
  const navigate = useNavigate()
  const { data, mergeLocaleData } = useProjectStore()
  const [search, setSearch] = useState('')
  const [activeLang, setActiveLang] = useState('en')
  const [activeDomain, setActiveDomain] = useState<Domain>('cards')
  const [addLangOpen, setAddLangOpen] = useState(false)
  const [newLang, setNewLang] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const languages = getLanguages(data.locales)
  const langData = data.locales[activeLang] ?? createEmptyLocaleData()

  function saveLangData(updated: LocaleData) {
    const nextLocales = { ...data.locales, [activeLang]: updated }
    setData('locales', nextLocales)
  }

  function addLanguage() {
    const code = newLang.trim().toLowerCase()
    if (!code || data.locales[code]) return
    const nextLocales = { ...data.locales, [code]: createEmptyLocaleData() }
    setData('locales', nextLocales)
    setActiveLang(code)
    setNewLang('')
    setAddLangOpen(false)
  }

  function removeLanguage(lang: string) {
    if (lang === 'en') return // Cannot remove default
    if (!confirm(`Remove language "${lang}"?`)) return
    const next = { ...data.locales }
    delete next[lang]
    setData('locales', next)
    if (activeLang === lang) setActiveLang('en')
  }

  function patchEntry(key: string, field: string, value: string) {
    if (activeDomain === 'common' || activeDomain === 'campaign') {
      // Flat string value
      const updated = { ...langData, [activeDomain]: { ...(langData[activeDomain] as Record<string, string>), [key]: value } }
      saveLangData(updated)
    } else {
      const domainData = langData[activeDomain] as Record<string, Record<string, string>>
      const current = domainData[key] ?? {}
      const updated = { ...langData, [activeDomain]: { ...domainData, [key]: { ...current, [field]: value } } }
      saveLangData(updated)
    }
  }

  const cellCls = 'bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500/50'
  const tabCls = (active: boolean) => `cursor-pointer px-3 py-1 rounded-full text-sm transition-colors ${active ? 'bg-violet-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`

  function renderTable() {
    if (activeDomain === 'cards') {
      const entries = Object.entries(langData.cards).filter(([id, v]) =>
        !search || v.name.toLowerCase().includes(search.toLowerCase()) || id.includes(search)
      )
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
              <th className="pb-2 pr-4 w-12">ID</th>
              <th className="pb-2 pr-4 w-48">Name</th>
              <th className="pb-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([id, val]) => (
              <tr key={id} className="border-b border-gray-800">
                <td className="py-2 pr-4 text-gray-500">{id}</td>
                <td className="py-2 pr-4">
                  <input value={val.name} onChange={(e) => patchEntry(id, 'name', e.target.value)} className={cellCls} />
                </td>
                <td className="py-2">
                  <input value={val.description} onChange={(e) => patchEntry(id, 'description', e.target.value)} className={cellCls} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (activeDomain === 'opponents') {
      const entries = Object.entries(langData.opponents).filter(([id, v]) =>
        !search || v.name.toLowerCase().includes(search.toLowerCase()) || id.includes(search)
      )
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
              <th className="pb-2 pr-4 w-12">ID</th>
              <th className="pb-2 pr-4 w-36">Name</th>
              <th className="pb-2 pr-4 w-36">Title</th>
              <th className="pb-2">Flavor</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([id, val]) => (
              <tr key={id} className="border-b border-gray-800">
                <td className="py-2 pr-4 text-gray-500">{id}</td>
                <td className="py-2 pr-4"><input value={val.name} onChange={(e) => patchEntry(id, 'name', e.target.value)} className={cellCls} /></td>
                <td className="py-2 pr-4"><input value={val.title} onChange={(e) => patchEntry(id, 'title', e.target.value)} className={cellCls} /></td>
                <td className="py-2"><input value={val.flavor} onChange={(e) => patchEntry(id, 'flavor', e.target.value)} className={cellCls} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (activeDomain === 'shop') {
      const entries = Object.entries(langData.shop).filter(([id, v]) =>
        !search || v.name.toLowerCase().includes(search.toLowerCase()) || id.includes(search)
      )
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
              <th className="pb-2 pr-4 w-36">Key</th>
              <th className="pb-2 pr-4 w-48">Name</th>
              <th className="pb-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([id, val]) => (
              <tr key={id} className="border-b border-gray-800">
                <td className="py-2 pr-4 text-gray-500 text-xs font-mono">{id}</td>
                <td className="py-2 pr-4"><input value={val.name} onChange={(e) => patchEntry(id, 'name', e.target.value)} className={cellCls} /></td>
                <td className="py-2"><input value={val.desc} onChange={(e) => patchEntry(id, 'desc', e.target.value)} className={cellCls} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    // campaign and common: flat key-value
    const domainData = langData[activeDomain] as Record<string, string>
    const entries = Object.entries(domainData).filter(([key, val]) =>
      !search || key.toLowerCase().includes(search.toLowerCase()) || (val ?? '').toLowerCase().includes(search.toLowerCase())
    )
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
            <th className="pb-2 pr-4 w-64">Key</th>
            <th className="pb-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, val]) => (
            <tr key={key} className="border-b border-gray-800">
              <td className="py-2 pr-4 text-gray-500 text-xs font-mono">{key}</td>
              <td className="py-2"><input value={val} onChange={(e) => patchEntry(key, '', e.target.value)} className={cellCls} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">Localization</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="ml-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm w-64" />
      </div>

      {/* Language tabs */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-400 uppercase tracking-wide mr-2">Language:</span>
        {languages.map((lang) => (
          <div key={lang} className="flex items-center gap-1">
            <button onClick={() => setActiveLang(lang)} className={tabCls(activeLang === lang)}>
              {lang.toUpperCase()}
            </button>
            {lang !== 'en' && (
              <button onClick={() => removeLanguage(lang)} className="cursor-pointer text-gray-600 hover:text-red-400 transition-colors">
                <FaXmark size={10} />
              </button>
            )}
          </div>
        ))}
        {addLangOpen ? (
          <div className="flex items-center gap-1">
            <input value={newLang} onChange={(e) => setNewLang(e.target.value)} placeholder="de"
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-16"
              onKeyDown={(e) => e.key === 'Enter' && addLanguage()} autoFocus />
            <button onClick={addLanguage} className="cursor-pointer text-green-400 hover:text-green-300 text-sm">Add</button>
            <button onClick={() => setAddLangOpen(false)} className="cursor-pointer text-gray-500 hover:text-gray-300 text-sm">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setAddLangOpen(true)} className="cursor-pointer text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm">
            <FaPlus size={10} /> Add
          </button>
        )}
        <button onClick={() => setImportOpen(true)} className="cursor-pointer text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm ml-2">
          <FaUpload size={12} /> Import
        </button>
      </div>

      {/* Domain tabs */}
      <div className="flex gap-2 mb-4">
        {DOMAIN_TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveDomain(key)} className={tabCls(activeDomain === key)}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {renderTable()}
        {Object.keys((langData[activeDomain] ?? {}) as Record<string, unknown>).length === 0 && (
          <div className="text-gray-500 text-center py-8">{search ? 'No matches.' : `No ${activeDomain} entries yet.`}</div>
        )}
      </div>

      {importOpen && (
        <LocaleImporter
          targetLang={activeLang}
          onImport={(importedData) => mergeLocaleData(activeLang, importedData)}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  )
}
