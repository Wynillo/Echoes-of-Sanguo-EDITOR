import type { LocaleData } from '../types/project'

export function createEmptyLocaleData(): LocaleData {
  return {
    common: {},
    cards: {},
    opponents: {},
    shop: {},
    campaign: {},
    races: {},
    attributes: {},
  }
}

export function getCardName(
  locales: Record<string, LocaleData>,
  lang: string,
  cardId: number | string,
): string {
  return locales[lang]?.cards[String(cardId)]?.name ?? `Card ${cardId}`
}

export function getCardDescription(
  locales: Record<string, LocaleData>,
  lang: string,
  cardId: number | string,
): string {
  return locales[lang]?.cards[String(cardId)]?.description ?? ''
}

export function getOpponentName(
  locales: Record<string, LocaleData>,
  lang: string,
  oppId: number | string,
): string {
  return locales[lang]?.opponents[String(oppId)]?.name ?? `Opponent ${oppId}`
}

export function getOpponentField(
  locales: Record<string, LocaleData>,
  lang: string,
  oppId: number | string,
  field: 'name' | 'title' | 'flavor',
): string {
  return locales[lang]?.opponents[String(oppId)]?.[field] ?? ''
}

export function getShopName(
  locales: Record<string, LocaleData>,
  lang: string,
  packId: string,
): string {
  return locales[lang]?.shop[packId]?.name ?? `Pack ${packId}`
}

export function getCampaignText(
  locales: Record<string, LocaleData>,
  lang: string,
  key: string,
): string {
  return locales[lang]?.campaign[key] ?? ''
}

/**
 * Immutably set a field in the locale data.
 * Returns a new locales record.
 */
export function setLocaleField<D extends keyof LocaleData>(
  locales: Record<string, LocaleData>,
  lang: string,
  domain: D,
  key: string,
  value: LocaleData[D][string],
): Record<string, LocaleData> {
  const langData = locales[lang] ?? createEmptyLocaleData()
  const domainData = langData[domain] as Record<string, LocaleData[D][string]>
  return {
    ...locales,
    [lang]: {
      ...langData,
      [domain]: {
        ...domainData,
        [key]: value,
      },
    },
  }
}

/**
 * Delete a key from a locale domain.
 */
export function deleteLocaleKey<D extends keyof LocaleData>(
  locales: Record<string, LocaleData>,
  lang: string,
  domain: D,
  key: string,
): Record<string, LocaleData> {
  const langData = locales[lang]
  if (!langData) return locales
  const domainData = { ...(langData[domain] as Record<string, unknown>) }
  delete domainData[key]
  return {
    ...locales,
    [lang]: {
      ...langData,
      [domain]: domainData,
    },
  }
}

/** Get all language codes configured in the locale registry */
export function getLanguages(locales: Record<string, LocaleData>): string[] {
  return Object.keys(locales)
}
