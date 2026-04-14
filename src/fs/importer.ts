import type { TcgLoadResult } from '@wynillo/tcg-format'
import type { ProjectData } from '../types/project'
import { writeJsonFile } from './writer'
import { createEmptyLocaleData } from '../utils/localeHelpers'
import { DEFAULT_ATTRIBUTES, DEFAULT_RACES, DEFAULT_RULES } from '../stores/projectStore'
import { autoCreateMissingCurrencies, autoCreateMissingOpponents, syncLocaleEntries } from '../utils/autoCreateEntities'

function convertCampaignChapters(chapters: any[]): any[] {
  return chapters.map((ch: any) => {
    const title = ch.title ?? ch.titleKey ?? ''
    const nodes = (ch.nodes ?? []).map((node: any) => {
      const converted: any = { ...node }
      if (node.gauntlet && Array.isArray(node.gauntlet)) {
        converted.opponentSequence = node.gauntlet
        delete converted.gauntlet
      }
      if (node.type === 'duel' && node.isBoss && !converted.opponentSequence) {
        converted.type = 'boss'
      }
      return converted
    })
    return { ...ch, title, nodes }
  })
}

export async function importTcgResult(
  result: TcgLoadResult,
  dir: FileSystemDirectoryHandle | null
): Promise<Partial<ProjectData> | null> {
  const cards = result.cards.map(({ id, type, rarity, level, atk, def,
    attribute, race, atkBonus, defBonus, equipReqRace, equipReqAttr,
    spellType, effect }) =>
    ({ id, type: type as 1 | 2 | 3 | 4 | 5, rarity: rarity as 1 | 2 | 4 | 6 | 8, level, atk, def, attribute, race,
      atkBonus, defBonus, equipReqRace, equipReqAttr, spellType: spellType as 1 | 2 | 3 | 4 | undefined, effect }))

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

  if (result.opponentDescriptions) {
    result.opponentDescriptions.forEach((descriptions, _lang) => {
      for (const desc of descriptions) {
        if (!localeData.opponents[String(desc.id)]) {
          localeData.opponents[String(desc.id)] = {
            name: desc.name ?? '',
            title: desc.title ?? '',
            flavor: desc.flavor ?? '',
          }
        }
      }
    })
  }

  const typeMeta = (result as any).typeMeta

  const campaign = convertCampaignChapters((result.campaignData as any)?.chapters ?? [])

  const populatedOpponents = autoCreateMissingOpponents(campaign, opponents, { en: localeData })

  if (dir) {
    const rulesToSave = result.rules ? {
      startingLP: result.rules.startingLP,
      maxFieldZones: result.rules.fieldZones,
      deckSize: result.rules.maxDeckSize,
      cardCopyLimit: result.rules.maxCardCopies,
      cardsDrawPerTurn: result.rules.drawPerTurn,
      handLimit: result.rules.handLimitDraw,
    } : DEFAULT_RULES

    await Promise.all([
      writeJsonFile(dir, 'cards.json', cards),
      writeJsonFile(dir, 'locales/en.json', localeData),
      writeJsonFile(dir, 'opponents.json', populatedOpponents),
      writeJsonFile(dir, 'campaign.json', { chapters: campaign }),
      writeJsonFile(dir, 'shop.json', result.shopData ?? { packs: [], currencies: [] }),
      writeJsonFile(dir, 'fusion_formulas.json', result.fusionFormulas ?? []),
      ...(rulesToSave ? [writeJsonFile(dir, 'rules.json', rulesToSave)] : []),
      ...(typeMeta?.attributes ? [writeJsonFile(dir, 'attributes.json', typeMeta.attributes)] : []),
      ...(typeMeta?.races ? [writeJsonFile(dir, 'races.json', typeMeta.races)] : []),
    ])
    return null
  }

  const rulesConverted = result.rules ? {
    startingLP: result.rules.startingLP,
    maxFieldZones: result.rules.fieldZones,
    deckSize: result.rules.maxDeckSize,
    cardCopyLimit: result.rules.maxCardCopies,
    cardsDrawPerTurn: result.rules.drawPerTurn,
    handLimit: result.rules.handLimitDraw,
  } : DEFAULT_RULES

  const shopPacks = (result.shopData as any)?.packs ?? []
  const shopCurrencies = (result.shopData as any)?.currencies ?? []
  const normalizedPacks = shopPacks.map((pack: any) => {
    const cardPool = Array.isArray(pack.cardPool)
      ? pack.cardPool
      : pack.cardPool?.include?.ids ?? []
    const price = typeof pack.price === 'object' ? pack.price : null
    return {
      id: pack.id,
      name: pack.name ?? pack.nameKey ?? 'Pack',
      cost: pack.cost ?? price?.amount ?? (typeof pack.price === 'number' ? pack.price : 0),
      drawCount: pack.drawCount ?? pack.slots?.reduce((sum: number, s: any) => sum + (s.count ?? 0), 0) ?? 0,
      cardPool,
      currencyId: pack.currencyId ?? price?.currencyId,
      unlockCondition: pack.unlockCondition?.type ? `${pack.unlockCondition.type}:${pack.unlockCondition.nodeId}` : undefined,
    }
  })

  const currencies = autoCreateMissingCurrencies(normalizedPacks, populatedOpponents, shopCurrencies, { en: localeData })

  syncLocaleEntries(populatedOpponents, normalizedPacks, currencies, { en: localeData })

  const starterDecks = result.starterDecks
    ? Object.entries(result.starterDecks).map(([raceId, cardIds]) => ({
        raceId: parseInt(raceId, 10),
        cardIds: cardIds as number[],
      }))
    : []

  return {
    cards,
    locales: { en: localeData },
    opponents: populatedOpponents,
    campaign,
    shop: normalizedPacks,
    fusion: result.fusionFormulas?.map(f => ({
      ...f,
      operands: [f.operand1, f.operand2],
    })) ?? [],
    rules: rulesConverted,
    attributes: typeMeta?.attributes ?? DEFAULT_ATTRIBUTES,
    races: typeMeta?.races ?? DEFAULT_RACES,
    images: {},
    currencies,
    starterDecks,
  }
}
