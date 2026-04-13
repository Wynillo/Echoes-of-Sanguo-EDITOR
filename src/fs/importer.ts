import type { TcgLoadResult } from '@wynillo/tcg-format'
import type { ProjectData } from '../types/project'
import { writeJsonFile, writeBinaryFile } from './writer'
import { createEmptyLocaleData } from '../utils/localeHelpers'
import { DEFAULT_ATTRIBUTES, DEFAULT_RACES, DEFAULT_RULES } from '../stores/projectStore'

export async function importTcgResult(
  result: TcgLoadResult,
  dir: FileSystemDirectoryHandle | null
): Promise<Partial<ProjectData> | null> {
  const cards = result.cards.map(({ id, type, rarity, level, atk, def,
    attribute, race, atkBonus, defBonus, equipReqRace, equipReqAttr,
    spellType, effect }) =>
    ({ id, type, rarity, level, atk, def, attribute, race,
      atkBonus, defBonus, equipReqRace, equipReqAttr, spellType, effect }))

  const localeData = createEmptyLocaleData()
  const parsedById = new Map(result.parsedCards.map((c) => [c.id, c]))
  for (const c of result.cards) {
    localeData.cards[String(c.id)] = {
      name: parsedById.get(c.id)?.name ?? `Card ${c.id}`,
      description: parsedById.get(c.id)?.description ?? '',
    }
  }

  const opponents = (result.opponents ?? []).map((opp: any) => {
    if (opp.name || opp.title || opp.flavor) {
      localeData.opponents[String(opp.id)] = {
        name: opp.name ?? '',
        title: opp.title ?? '',
        flavor: opp.flavor ?? '',
      }
      const { name, title, flavor, ...rest } = opp
      return rest
    }
    return opp
  })

  const typeMeta = (result as any).typeMeta

  if (dir) {
    await Promise.all([
      writeJsonFile(dir, 'cards.json', cards),
      writeJsonFile(dir, 'locales/en.json', localeData),
      writeJsonFile(dir, 'opponents.json', opponents),
      writeJsonFile(dir, 'campaign.json', result.campaignData ?? []),
      writeJsonFile(dir, 'shop.json', { packs: result.shopData ?? [], currencies: [] }),
      writeJsonFile(dir, 'fusion_formulas.json', result.fusionFormulas ?? []),
      ...(result.rules ? [writeJsonFile(dir, 'rules.json', result.rules)] : []),
      ...(typeMeta?.attributes ? [writeJsonFile(dir, 'attributes.json', typeMeta.attributes)] : []),
      ...(typeMeta?.races ? [writeJsonFile(dir, 'races.json', typeMeta.races)] : []),
      ...Array.from(result.rawImages.entries()).map(([id, buf]) =>
        writeBinaryFile(dir, `img/${id}.png`, buf)
      ),
    ])
    return null
  }

  const images: Record<number, Blob> = {}
  for (const [id, buf] of result.rawImages.entries()) {
    images[Number(id)] = new Blob([buf], { type: 'image/png' })
  }

  return {
    cards,
    locales: { en: localeData },
    opponents,
    campaign: result.campaignData ?? [],
    shop: result.shopData ?? [],
    fusion: result.fusionFormulas ?? [],
    rules: result.rules ?? DEFAULT_RULES,
    attributes: typeMeta?.attributes ?? DEFAULT_ATTRIBUTES,
    races: typeMeta?.races ?? DEFAULT_RACES,
    images,
    currencies: [],
    starterDecks: [],
  }
}