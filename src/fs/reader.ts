import type { ProjectData, EditorCard, EditorCardLocale, EditorOpponent,
  EditorCampaignChapter, EditorShopPack, EditorFusionFormula, EditorRules, EditorModInfo } from '../types/project'

async function readJson<T>(dir: FileSystemDirectoryHandle, filename: string, fallback: T): Promise<T> {
  try {
    const fh = await dir.getFileHandle(filename)
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
      if (entry.kind === 'file' && entry.name.endsWith('.png')) {
        const id = parseInt(entry.name.replace('.png', ''), 10)
        if (!isNaN(id)) {
          const fh = await imgDir.getFileHandle(entry.name)
          images[id] = await (await fh.getFile()).arrayBuffer().then((ab) => new Blob([ab], { type: 'image/png' }))
        }
      }
    }
  } catch { /* img folder optional */ }
  return images
}

export async function readProjectFolder(dir: FileSystemDirectoryHandle): Promise<Partial<ProjectData>> {
  const DEFAULT_RULES: EditorRules = {
    startingLP: 8000, maxFieldZones: 5, deckSize: 40,
    cardCopyLimit: 3, cardsDrawPerTurn: 1, handLimit: 8,
  }
  const DEFAULT_MOD_INFO: EditorModInfo = {
    id: '', name: '', version: '1.0.0', author: '', type: 'expansion',
    description: '', minEngineVersion: '1.0.0', formatVersion: 2,
  }

  const [cards, cardLocales, opponents, campaign, shop, fusion, rules, modInfo, images] = await Promise.all([
    readJson<EditorCard[]>(dir, 'cards.json', []),
    // Try locales/en.json first (new format), fall back to cards_description.json (old format)
    readJson<EditorCardLocale[]>(dir, 'locales/en.json', []).then(
      (r) => r.length > 0 ? r : readJson<EditorCardLocale[]>(dir, 'cards_description.json', [])
    ),
    readJson<EditorOpponent[]>(dir, 'opponents.json', []),
    readJson<EditorCampaignChapter[]>(dir, 'campaign.json', []),
    readJson<EditorShopPack[]>(dir, 'shop.json', []),
    readJson<EditorFusionFormula[]>(dir, 'fusion_formulas.json', []),
    readJson<EditorRules>(dir, 'rules.json', DEFAULT_RULES),
    readJson<EditorModInfo>(dir, 'mod.json', DEFAULT_MOD_INFO),
    readImages(dir),
  ])
  return { cards, cardLocales, opponents, campaign, shop, fusion, rules, modInfo, images }
}
