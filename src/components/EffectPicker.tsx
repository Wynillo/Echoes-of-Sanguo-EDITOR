import { EFFECT_ACTION_IDS } from '../data/effects'

interface Props {
  value: string
  onChange: (v: string) => void
  label?: string
}

export default function EffectPicker({ value, onChange, label }: Props) {
  return (
    <div>
      {label && <label className="text-xs text-gray-400 mb-1 block">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
      >
        <option value="">— none —</option>
        {EFFECT_ACTION_IDS.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </div>
  )
}
