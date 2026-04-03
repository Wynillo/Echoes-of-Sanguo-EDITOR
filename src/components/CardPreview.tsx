import { useMemo, useEffect } from 'react'
import { GiSun, GiMoon, GiFlame, GiWaterDrop, GiMountains, GiTornado } from 'react-icons/gi'
import { FaStar } from 'react-icons/fa6'
import type { EditorCard, EditorCardLocale } from '../types/project'

// Attribute colors matching game style
const ATTR_COLORS: Record<number, string> = {
  1: '#c09000', 2: '#7020a0', 3: '#c0300a',
  4: '#1a6aaa', 5: '#6a7030', 6: '#4a6080',
}
const ATTR_ICONS: Record<number, React.ComponentType<{ size?: number; color?: string }>> = {
  1: GiSun, 2: GiMoon, 3: GiFlame, 4: GiWaterDrop, 5: GiMountains, 6: GiTornado,
}
const TYPE_BG: Record<number, string> = {
  1: 'bg-amber-900', 2: 'bg-purple-900', 3: 'bg-teal-900',
  4: 'bg-pink-900', 5: 'bg-orange-900',
}

interface CardPreviewProps {
  card: Partial<EditorCard>
  locale: Partial<EditorCardLocale>
  image: Blob | null
}

export default function CardPreview({ card, locale, image }: CardPreviewProps) {
  const color = ATTR_COLORS[card.attribute ?? 0] ?? '#444'
  const AttrIcon = card.attribute ? ATTR_ICONS[card.attribute] : null

  const imageUrl = useMemo(() => image ? URL.createObjectURL(image) : null, [image])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  return (
    <div className={`w-36 rounded-xl overflow-hidden shadow-lg border border-white/10 flex flex-col ${TYPE_BG[card.type ?? 1] ?? 'bg-gray-800'}`}
      style={{ background: `linear-gradient(160deg, ${color}44, ${color}11)` }}>
      {/* Header */}
      <div className="px-2 pt-2 pb-1">
        <div className="text-xs font-bold truncate text-white">{locale.name || 'Unnamed'}</div>
        {card.level != null && (
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {Array.from({ length: Math.min(card.level, 12) }).map((_, i) => (
              <FaStar key={i} size={8} className="text-yellow-400" />
            ))}
          </div>
        )}
      </div>
      {/* Artwork */}
      <div className="mx-2 rounded bg-black/30 flex items-center justify-center overflow-hidden"
        style={{ height: 80 }}>
        {imageUrl
          ? <img src={imageUrl} className="w-full h-full object-cover" alt="" />
          : <span className="text-white/20 text-xs">No artwork</span>}
      </div>
      {/* Stats */}
      <div className="px-2 py-1.5 mt-auto">
        {(card.type === 1 || card.type === 2) && (
          <div className="flex justify-between text-xs font-bold text-white">
            <span>{card.atk ?? '—'}</span>
            <span>{card.def ?? '—'}</span>
          </div>
        )}
        {AttrIcon && (
          <div className="text-right mt-0.5">
            <AttrIcon size={14} color={color} />
          </div>
        )}
      </div>
    </div>
  )
}
