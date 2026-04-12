import { loadTcgFile } from '@wynillo/tcg-format'
import type { TcgLoadResult } from '@wynillo/tcg-format'
import JSZip from 'jszip'
import type { ProjectData } from '../types/project'
import { convertToWebp } from '../utils/imageConvert'

export type { TcgLoadResult }

// Hardcoded reference data matching MOD-base
const CARD_TYPES = [
  { id: 1, key: 'Monster',   color: '#c8a850', icon: 'GiMonsterGrasp' },
  { id: 2, key: 'Fusion',    color: '#a050c0', icon: 'GiMagicSwirl' },
  { id: 3, key: 'Spell',     color: '#1dc0a0', icon: 'GiSpellBook' },
  { id: 4, key: 'Trap',      color: '#bc2060', icon: 'GiBearTrap' },
  { id: 5, key: 'Equipment', color: '#e08030', icon: 'GiCrossedSwords' },
]

const RARITIES = [
  { id: 1,  key: 'Normal',    color: '#aaaaaa' },
  { id: 2,  key: 'Uncommon',  color: '#7ec8e3' },
  { id: 4,  key: 'Rare',      color: '#f5c518' },
  { id: 6,  key: 'SuperRare', color: '#c084fc' },
  { id: 8,  key: 'HyperRare', color: '#f97316' },
  { id: 10, key: 'UltraRare', color: '#ff6600' },
  { id: 12, key: 'Ultra',     color: '#000000' },
]

export async function openTcgFile(file: File): Promise<TcgLoadResult> {
  const buf = await file.arrayBuffer()
  return loadTcgFile(buf)
}

export async function exportTcgToBlob(
  data: ProjectData,
): Promise<Blob> {
  const zip = new JSZip()

  // Core data files
  zip.file('cards.json', JSON.stringify(data.cards, null, 2))
  zip.file('opponents.json', JSON.stringify(data.opponents, null, 2))
  zip.file('campaign.json', JSON.stringify(data.campaign, null, 2))
  zip.file('fusion_formulas.json', JSON.stringify(data.fusion, null, 2))
  zip.file('rules.json', JSON.stringify(data.rules, null, 2))
  zip.file('attributes.json', JSON.stringify(data.attributes, null, 2))
  zip.file('races.json', JSON.stringify(data.races, null, 2))

  // Reference data
  zip.file('card_types.json', JSON.stringify(CARD_TYPES, null, 2))
  zip.file('rarities.json', JSON.stringify(RARITIES, null, 2))

  // Shop with embedded currencies
  zip.file('shop.json', JSON.stringify({
    packs: data.shop,
    currencies: data.currencies,
  }, null, 2))

  // Starter decks (MOD-base format: { raceId: cardIds[] })
  const starterDecksObj: Record<string, number[]> = {}
  for (const deck of data.starterDecks) {
    starterDecksObj[String(deck.raceId)] = deck.cardIds
  }
  zip.file('starterDecks.json', JSON.stringify(starterDecksObj, null, 2))

  // Locales per language
  for (const [lang, localeData] of Object.entries(data.locales)) {
    zip.file(`locales/${lang}.json`, JSON.stringify(localeData, null, 2))
  }

  // Mod info
  zip.file('mod.json', JSON.stringify({
    id: data.modInfo.id,
    name: data.modInfo.name,
    version: data.modInfo.version,
    author: data.modInfo.author,
    type: data.modInfo.type,
    description: data.modInfo.description,
    minEngineVersion: data.modInfo.minEngineVersion,
  }, null, 2))
  zip.file('manifest.json', JSON.stringify({
    formatVersion: data.modInfo.formatVersion,
    name: data.modInfo.name,
    author: data.modInfo.author,
  }, null, 2))

  // Images converted to WebP
  for (const [id, blob] of Object.entries(data.images)) {
    try {
      const webpBlob = await convertToWebp(blob)
      const buf = await webpBlob.arrayBuffer()
      zip.file(`img/${id}.webp`, buf)
    } catch {
      // Fallback: export as-is
      const buf = await blob.arrayBuffer()
      zip.file(`img/${id}.png`, buf)
    }
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
