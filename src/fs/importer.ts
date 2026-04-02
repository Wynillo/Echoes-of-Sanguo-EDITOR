import type { TcgLoadResult } from '@wynillo/tcg-format'
import { writeJsonFile, writeBinaryFile } from './writer'

export async function importTcgResult(
  result: TcgLoadResult,
  dir: FileSystemDirectoryHandle
): Promise<void> {
  const cards = result.cards.map(({ id, type, rarity, level, atk, def,
    attribute, race, atkBonus, defBonus, equipReqRace, equipReqAttr,
    spellType, effect }) =>
    ({ id, type, rarity, level, atk, def, attribute, race,
      atkBonus, defBonus, equipReqRace, equipReqAttr, spellType, effect }))

  // parsedCards have name/description embedded directly from the definitions locale
  const parsedById = new Map(result.parsedCards.map((c) => [c.id, c]))

  const cardLocales = result.cards.map((c) => ({
    id: c.id,
    name: parsedById.get(c.id)?.name ?? `Card ${c.id}`,
    description: parsedById.get(c.id)?.description ?? '',
  }))

  await Promise.all([
    writeJsonFile(dir, 'cards.json', cards),
    writeJsonFile(dir, 'locales/en.json', cardLocales),
    writeJsonFile(dir, 'opponents.json', result.opponents ?? []),
    writeJsonFile(dir, 'campaign.json', result.campaignData ?? []),
    writeJsonFile(dir, 'shop.json', result.shopData ?? []),
    writeJsonFile(dir, 'fusion_formulas.json', result.fusionFormulas ?? []),
    ...(result.rules ? [writeJsonFile(dir, 'rules.json', result.rules)] : []),
    ...Array.from(result.rawImages.entries()).map(([id, buf]) =>
      writeBinaryFile(dir, `img/${id}.png`, buf)
    ),
  ])
}
