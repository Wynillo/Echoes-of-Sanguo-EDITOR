import { useTranslation } from 'react-i18next'
import { FaGlobe } from 'react-icons/fa6'

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lng = event.target.value
    i18n.changeLanguage(lng)
    localStorage.setItem('preferredLanguage', lng)
  }

  return (
    <div className="flex items-center gap-2">
      <FaGlobe className="text-gray-400" size={14} />
      <select
        value={i18n.language || 'en'}
        onChange={handleChange}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-600 cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
