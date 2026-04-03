import { useMemo, useState } from 'react'
import { validateTcgCards } from '@wynillo/tcg-format'
import { useProjectStore } from '../stores/projectStore'
import { FaXmark, FaChevronUp, FaChevronDown, FaTriangleExclamation } from 'react-icons/fa6'

export function useValidation() {
  const { data } = useProjectStore()
  return useMemo(() => {
    const result = validateTcgCards(data.cards)
    return {
      errors: result.errors,
      warnings: result.warnings,
      hasErrors: !result.valid,
    }
  }, [data.cards])
}

export default function ValidationBanner() {
  const { errors, warnings } = useValidation()
  const [expanded, setExpanded] = useState(false)

  if (errors.length === 0 && warnings.length === 0) return null

  return (
    <div className={`rounded-xl border px-4 py-3 mb-4 ${errors.length > 0 ? 'border-red-700 bg-red-950/40' : 'border-yellow-700 bg-yellow-950/40'}`}>
      <button
        onClick={() => setExpanded((x) => !x)}
        className="cursor-pointer w-full flex items-center justify-between text-left"
      >
        <span className="font-semibold text-sm">
          {errors.length > 0
            ? `${errors.length} validation error${errors.length > 1 ? 's' : ''} — export blocked`
            : `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`}
        </span>
        <span className="text-gray-400">{expanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}</span>
      </button>

      {expanded && (
        <ul className="mt-2 space-y-1">
          {errors.map((msg, i) => (
            <li key={i} className="text-sm text-red-300 flex gap-2 items-start">
              <FaXmark size={12} className="flex-shrink-0 text-red-500 mt-0.5" />{msg}
            </li>
          ))}
          {warnings.map((msg, i) => (
            <li key={i} className="text-sm text-yellow-300 flex gap-2 items-start">
              <FaTriangleExclamation size={12} className="flex-shrink-0 text-yellow-500 mt-0.5" />{msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
