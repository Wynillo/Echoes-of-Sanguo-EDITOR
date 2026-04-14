import { useState } from 'react'
import { FaUpload, FaXmark, FaCheck } from 'react-icons/fa6'
import type { LocaleData } from '../types/project'

interface LocaleImporterProps {
  targetLang: string
  onImport: (data: LocaleData) => void
  onClose: () => void
}

interface ImportPreview {
  common: number
  cards: number
  opponents: number
  shop: number
  campaign: number
  races: number
  attributes: number
}

export default function LocaleImporter({ targetLang, onImport, onClose }: LocaleImporterProps) {
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [parsedData, setParsedData] = useState<LocaleData | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setError('Please select a JSON file')
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text) as LocaleData

      // Validate structure
      if (typeof data !== 'object' || Array.isArray(data)) {
        setError('Invalid locale file format. Expected LocaleData object.')
        return
      }

      const previewData: ImportPreview = {
        common: Object.keys(data.common ?? {}).length,
        cards: Object.keys(data.cards ?? {}).length,
        opponents: Object.keys(data.opponents ?? {}).length,
        shop: Object.keys(data.shop ?? {}).length,
        campaign: Object.keys(data.campaign ?? {}).length,
        races: Object.keys(data.races ?? {}).length,
        attributes: Object.keys(data.attributes ?? {}).length,
      }

      setPreview(previewData)
      setParsedData(data)
      setError(null)
    } catch (err) {
      setError(`Failed to parse file: ${(err as Error).message}`)
      setPreview(null)
      setParsedData(null)
    }
  }

  function handleImport() {
    if (parsedData) {
      onImport(parsedData)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <FaUpload className="text-indigo-400" size={20} />
          <h2 className="text-lg font-semibold">Import Locale Data</h2>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-white">
            <FaXmark size={16} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            Import locale entries for language: <span className="text-white font-mono">{targetLang.toUpperCase()}</span>
          </p>
          <p className="text-xs text-gray-500">
            Existing entries will be preserved. Missing entries will be added from the imported file.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Select JSON file</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-700 file:text-white hover:file:bg-indigo-600"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {preview && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-indigo-400">Preview</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Common:</span>
                <span className="text-white">{preview.common} entries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cards:</span>
                <span className="text-white">{preview.cards} entries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Opponents:</span>
                <span className="text-white">{preview.opponents} entries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shop:</span>
                <span className="text-white">{preview.shop} entries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Campaign:</span>
                <span className="text-white">{preview.campaign} entries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Races:</span>
                <span className="text-white">{preview.races} entries</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!parsedData}
            className="px-4 py-2 text-sm bg-indigo-700 hover:bg-indigo-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaCheck size={14} />
            Import
          </button>
        </div>
      </div>
    </div>
  )
}
