import { useMemo, useState } from 'react'
import { validateTcgCards } from '@wynillo/tcg-format/validators'
import { useProjectStore } from '../stores/projectStore'
import { validateProject } from '../validation/validateProject'
import type { ValidationIssue } from '../validation/validateProject'
import { FaXmark, FaChevronUp, FaChevronDown, FaTriangleExclamation } from 'react-icons/fa6'

export function useValidation() {
  const { data } = useProjectStore()
  return useMemo(() => {
    const cardResult = validateTcgCards(data.cards)
    const projectResult = validateProject(data)

    const errors = [
      ...cardResult.errors.map((msg) => ({ domain: 'cards', entityId: '', message: msg, severity: 'error' as const })),
      ...projectResult.errors,
    ]
    const warnings = [
      ...cardResult.warnings.map((msg) => ({ domain: 'cards', entityId: '', message: msg, severity: 'warning' as const })),
      ...projectResult.warnings,
    ]

    return {
      errors,
      warnings,
      hasErrors: errors.length > 0,
    }
  }, [data])
}

export default function ValidationBanner() {
  const { errors, warnings } = useValidation()
  const [expanded, setExpanded] = useState(false)

  if (errors.length === 0 && warnings.length === 0) return null

  // Group by domain
  const grouped = new Map<string, ValidationIssue[]>()
  for (const issue of [...errors, ...warnings]) {
    const list = grouped.get(issue.domain) ?? []
    list.push(issue)
    grouped.set(issue.domain, list)
  }

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
        <div className="mt-2 space-y-3">
          {[...grouped.entries()].map(([domain, issues]) => (
            <div key={domain}>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{domain} ({issues.length})</div>
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className={`text-sm flex gap-2 items-start ${issue.severity === 'error' ? 'text-red-300' : 'text-yellow-300'}`}>
                    {issue.severity === 'error'
                      ? <FaXmark size={12} className="flex-shrink-0 text-red-500 mt-0.5" />
                      : <FaTriangleExclamation size={12} className="flex-shrink-0 text-yellow-500 mt-0.5" />}
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
