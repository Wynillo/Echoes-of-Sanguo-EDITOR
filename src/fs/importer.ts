// Type alias for the result from @wynillo/tcg-format loadTcgFile
// We define this locally since the package may not be installed yet
export interface TcgLoadResultLike {
  cards: Array<{
    id: number
    type: number
    rarity: number
    level?: number
    atk?: number
    def?: number
    attribute?: number
    race?: number
    atkBonus?: number
    defBonus?: number
    equipReqRace?: number
    equipReqAttr?: number
    spellType?: number
    effect?: string
    effects?: Array<{ trigger: string; actions: string[] }>
  }>
  definitions?: Map<number, { name: string; description: string }>
  images: Map<number, ArrayBuffer>
  opponents?: unknown[]
  campaignData?: unknown
  shopData?: unknown
  fusionFormulas?: unknown[]
  rules?: unknown
}

import { writeJsonFile, writeBinaryFile } from './writer'

export async function importTcgResult(
  result: TcgLoadResultLike,
  dir: FileSystemDirectoryHandle
): Promise<void> {
  const cards = result.cards.map(({ id, type, rarity, level, atk, def,
    attribute, race, atkBonus, defBonus, equipReqRace, equipReqAttr,
    spellType, effect, effects }) =>
    ({ id, type, rarity, level, atk, def, attribute, race,
      atkBonus, defBonus, equipReqRace, equipReqAttr, spellType, effect, effects }))

  const cardLocales = result.cards.map((c) => ({
    id: c.id,
    name: result.definitions?.get(c.id)?.name ?? `Card ${c.id}`,
    description: result.definitions?.get(c.id)?.description ?? '',
  }))

  await Promise.all([
    writeJsonFile(dir, 'cards.json', cards),
    writeJsonFile(dir, 'locales/en.json', cardLocales),
    writeJsonFile(dir, 'opponents.json', result.opponents ?? []),
    writeJsonFile(dir, 'campaign.json', result.campaignData ?? []),
    writeJsonFile(dir, 'shop.json', result.shopData ?? []),
    writeJsonFile(dir, 'fusion_formulas.json', result.fusionFormulas ?? []),
    ...(result.rules ? [writeJsonFile(dir, 'rules.json', result.rules)] : []),
    ...Array.from(result.images.entries()).map(([id, buf]) =>
      writeBinaryFile(dir, `img/${id}.png`, buf)
    ),
  ])
}
