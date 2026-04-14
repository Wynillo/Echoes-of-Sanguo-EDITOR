import type { ProjectData, EditorCard, EditorOpponent,
  EditorCampaignChapter, EditorShopPack, EditorFusionFormula, EditorRules, EditorModInfo,
  EditorAttribute, EditorRace, LocaleData, EditorCurrency, EditorStarterDeck } from '../types/project'
import { DEFAULT_ATTRIBUTES, DEFAULT_RACES } from '../stores/projectStore'
import { migrateProjectData } from '../utils/migrations'
import { autoCreateMissingCurrencies, autoCreateMissingOpponents, syncLocaleEntries } from '../utils/autoCreateEntities'

async function readJson<T>(dir: FileSystemDirectoryHandle, filename: string, fallback: T): Promise<T> {
  try {
    // Support nested paths like "locales/en.json"
    const parts = filename.split('/')
    let current = dir
    for (const part of parts.slice(0, -1)) {
      current = await current.getDirectoryHandle(part)
    }
    const fh = await current.getFileHandle(parts[parts.length - 1])
    const file = await fh.getFile()
    return JSON.parse(await file.text()) as T
  } catch {
    return fallback
  }
}

async function readImages(dir: FileSystemDirectoryHandle): Promise<Record<number, Blob>> {
  const images: Record<number, Blob> = {}
  try {
    const imgDir = await dir.getDirectoryHandle('img')
    for await (const entry of (imgDir as any).values()) {
      if (entry.kind !== 'file') continue
      const name: string = entry.name
      const ext = name.split('.').pop()?.toLowerCase()
      if (!ext || !['png', 'jpg', 'jpeg', 'webp'].includes(ext)) continue
      const id = parseInt(name.replace(/\.[^.]+$/, ''), 10)
      if (isNaN(id)) continue
      const fh = await imgDir.getFileHandle(name)
      const file = await fh.getFile()
      const mimeMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }
      images[id] = await file.arrayBuffer().then((ab) => new Blob([ab], { type: mimeMap[ext] ?? 'image/png' }))
    }
  } catch { /* img folder optional */ }
  return images
}

async function readLocales(dir: FileSystemDirectoryHandle): Promise<Record<string, LocaleData> | null> {
  try {
    const localesDir = await dir.getDirectoryHandle('locales')
    const result: Record<string, LocaleData> = {}
    for await (const entry of (localesDir as any).values()) {
      if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue
      const lang = entry.name.replace('.json', '')
      const fh = await localesDir.getFileHandle(entry.name)
      const file = await fh.getFile()
      const parsed = JSON.parse(await file.text())
      // Check if this is the new format (has domain keys) or old format (array)
      if (Array.isArray(parsed)) {
        // Old format: EditorCardLocale[] — will be migrated
        return null
      }
      // New format: LocaleData object
      result[lang] = {
        common: parsed.common ?? {},
        cards: parsed.cards ?? {},
        opponents: parsed.opponents ?? {},
        shop: parsed.shop ?? {},
        campaign: parsed.campaign ?? {},
        races: parsed.races ?? {},
        attributes: parsed.attributes ?? {},
      }
    }
    return Object.keys(result).length > 0 ? result : null
  } catch {
    return null
  }
}

async function readShopData(dir: FileSystemDirectoryHandle): Promise<{ packs: EditorShopPack[]; currencies: EditorCurrency[] }> {
  try {
    const fh = await dir.getFileHandle('shop.json')
    const file = await fh.getFile()
    const parsed = JSON.parse(await file.text())
    // New format: { packs: [...], currencies: [...] }
    if (parsed.packs && Array.isArray(parsed.packs)) {
      return { packs: parsed.packs, currencies: parsed.currencies ?? [] }
    }
    // Old format: plain array of packs
    if (Array.isArray(parsed)) {
      return { packs: parsed, currencies: [] }
    }
    return { packs: [], currencies: [] }
  } catch {
    return { packs: [], currencies: [] }
  }
}

async function readStarterDecks(dir: FileSystemDirectoryHandle): Promise<EditorStarterDeck[]> {
  try {
    const fh = await dir.getFileHandle('starterDecks.json')
    const file = await fh.getFile()
    const parsed = JSON.parse(await file.text())
    // MOD-base format: { "raceId": [cardIds...] }
    if (!Array.isArray(parsed) && typeof parsed === 'object') {
      return Object.entries(parsed).map(([raceId, cardIds]) => ({
        raceId: parseInt(raceId, 10),
        cardIds: cardIds as number[],
      }))
    }
    // Already in editor format
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export async function readProjectFolder(dir: FileSystemDirectoryHandle): Promise<Partial<ProjectData>> {
  const DEFAULT_RULES_VAL: EditorRules = {
    startingLP: 8000, maxFieldZones: 5, deckSize: 40,
    cardCopyLimit: 3, cardsDrawPerTurn: 1, handLimit: 8,
  }
  const DEFAULT_MOD_INFO: EditorModInfo = {
    id: '', name: '', version: '1.0.0', author: '', type: 'expansion',
    description: '', minEngineVersion: '1.0.0', formatVersion: 2,
  }

  const [cards, opponents, campaign, fusion, rules, modInfo, images, attributes, races, locales, shopData, starterDecks] = await Promise.all([
    readJson<EditorCard[]>(dir, 'cards.json', []),
    readJson<EditorOpponent[]>(dir, 'opponents.json', []),
    readJson<EditorCampaignChapter[]>(dir, 'campaign.json', []),
    readJson<EditorFusionFormula[]>(dir, 'fusion_formulas.json', []),
    readJson<EditorRules>(dir, 'rules.json', DEFAULT_RULES_VAL),
    readJson<EditorModInfo>(dir, 'mod.json', DEFAULT_MOD_INFO),
    readImages(dir),
    readJson<EditorAttribute[]>(dir, 'attributes.json', DEFAULT_ATTRIBUTES),
    readJson<EditorRace[]>(dir, 'races.json', DEFAULT_RACES),
    readLocales(dir),
    readShopData(dir),
    readStarterDecks(dir),
  ])

  // Initialize locales if not loaded
  const localesData = locales ?? { en: { common: {}, cards: {}, opponents: {}, shop: {}, campaign: {}, races: {}, attributes: {} } }

  // Auto-create missing currencies referenced by shop packs
  const currencies = autoCreateMissingCurrencies(
    shopData.packs,
    opponents,
    shopData.currencies,
    localesData
  )

  // Auto-create missing opponents referenced by campaign nodes
  const populatedOpponents = autoCreateMissingOpponents(
    campaign,
    opponents,
    localesData
  )

  // Sync locale entries for all entities
  syncLocaleEntries(populatedOpponents, shopData.packs, currencies, localesData)

  const rawData: Record<string, unknown> = {
    cards,
    opponents: populatedOpponents,
    campaign,
    fusion,
    rules,
    modInfo,
    images,
    attributes,
    races,
    locales: localesData,
    shop: shopData.packs,
    currencies,
    starterDecks,
  }

  if (!locales) {
    // Try reading old format for migration
    const oldCardLocales = await readJson<Array<{ id: number; name: string; description: string }>>(
      dir, 'locales/en.json', []
    ).then(r => r.length > 0 ? r : readJson(dir, 'cards_description.json', []))

    if (oldCardLocales.length > 0) {
      rawData.cardLocales = oldCardLocales
    }
  }

  // Run migration (handles old → new format, idempotent)
  return migrateProjectData(rawData)
}
