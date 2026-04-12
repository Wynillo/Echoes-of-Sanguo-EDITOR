import type { EditorCardLocale, LocaleData, ProjectData } from '../types/project'
import { createEmptyLocaleData } from './localeHelpers'

interface OldOpponent {
  id: number
  race?: number
  coinsWin: number
  coinsLoss: number
  deckIds: number[]
  behavior: string
  name?: string
  title?: string
  flavor?: string
  currencyId?: string
  unlockCondition?: string
}

interface OldCampaignNode {
  id: string
  type: string
  duels?: number[]
  opponentId?: number
  storyId?: string
  unlockConditions?: unknown[]
  unlockCondition?: unknown
  rewards?: unknown
  position?: { x: number; y: number }
  isBoss?: boolean
  opponentSequence?: number[]
}

interface OldProjectData {
  cardLocales?: EditorCardLocale[]
  locales?: Record<string, LocaleData>
  opponents?: OldOpponent[]
  campaign?: Array<{ id: string; title: string; nodes: OldCampaignNode[] }>
  currencies?: unknown[]
  starterDecks?: unknown[]
  [key: string]: unknown
}

/**
 * Detect and migrate old project format to new format.
 * - Converts cardLocales[] → locales.en.cards (keyed by ID)
 * - Extracts opponent name/title/flavor → locales.en.opponents
 * - Strips name/title/flavor from opponents
 * - Converts campaign duels[] → opponentId
 * - Adds currencies/starterDecks defaults if missing
 * Idempotent: already-migrated data passes through unchanged.
 */
export function migrateProjectData(data: OldProjectData): Partial<ProjectData> {
  const result = { ...data } as Record<string, unknown>

  // Migrate cardLocales → locales
  if (data.cardLocales && !data.locales) {
    const localeData = createEmptyLocaleData()

    // Convert card locales array to keyed object
    for (const cl of data.cardLocales) {
      localeData.cards[String(cl.id)] = {
        name: cl.name,
        description: cl.description,
      }
    }

    // Extract opponent text to locales
    if (data.opponents) {
      for (const opp of data.opponents) {
        if (opp.name || opp.title || opp.flavor) {
          localeData.opponents[String(opp.id)] = {
            name: opp.name ?? '',
            title: opp.title ?? '',
            flavor: opp.flavor ?? '',
          }
        }
      }
    }

    result.locales = { en: localeData }
    delete result.cardLocales
  }

  // Strip name/title/flavor from opponents
  if (data.opponents) {
    result.opponents = data.opponents.map((opp) => {
      const { name, title, flavor, ...rest } = opp
      return rest
    })
  }

  // Migrate campaign nodes: duels[] → opponentId
  if (data.campaign) {
    result.campaign = data.campaign.map((chapter) => ({
      ...chapter,
      nodes: chapter.nodes.map((node) => {
        if (node.duels && node.duels.length > 0 && node.opponentId === undefined) {
          const { duels, unlockConditions, ...rest } = node
          return {
            ...rest,
            opponentId: duels[0],
            // Convert unlockConditions array to single unlockCondition if needed
            unlockCondition: unlockConditions?.[0] ?? node.unlockCondition ?? undefined,
          }
        }
        // Also migrate unlockConditions → unlockCondition
        if (node.unlockConditions && node.unlockCondition === undefined) {
          const { unlockConditions, ...rest } = node
          return { ...rest, unlockCondition: unlockConditions[0] ?? undefined }
        }
        return node
      }),
    }))
  }

  // Ensure new fields have defaults
  if (!result.currencies) result.currencies = []
  if (!result.starterDecks) result.starterDecks = []
  if (!result.locales) {
    result.locales = { en: createEmptyLocaleData() }
  }

  return result as Partial<ProjectData>
}
