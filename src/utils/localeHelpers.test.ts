import { describe, it, expect } from 'vitest'
import {
  createEmptyLocaleData,
  getCardName,
  getCardDescription,
  getOpponentName,
  getOpponentField,
  getShopName,
  getCampaignText,
  setLocaleField,
  deleteLocaleKey,
  getLanguages,
} from './localeHelpers'
import type { LocaleData } from '../types/project'

function makeLocales(): Record<string, LocaleData> {
  return {
    en: {
      common: {},
      cards: { '1': { name: 'Red Dragon', description: 'A fierce dragon.' } },
      opponents: { '1': { name: 'Liu Bei', title: 'Lord', flavor: 'Benevolent ruler.' } },
      shop: { 'p1': { name: 'Starter Pack', desc: 'Basic cards.' } },
      campaign: { 'ch1.intro': 'Welcome to the battlefield!' },
      races: { '1': 'Dragon' },
      attributes: { '1': 'Light' },
    },
  }
}

describe('createEmptyLocaleData', () => {
  it('returns an object with all empty domains', () => {
    const data = createEmptyLocaleData()
    expect(data.common).toEqual({})
    expect(data.cards).toEqual({})
    expect(data.opponents).toEqual({})
    expect(data.shop).toEqual({})
    expect(data.campaign).toEqual({})
    expect(data.races).toEqual({})
    expect(data.attributes).toEqual({})
  })
})

describe('getCardName', () => {
  it('returns card name from locales', () => {
    expect(getCardName(makeLocales(), 'en', 1)).toBe('Red Dragon')
  })

  it('returns fallback for missing card', () => {
    expect(getCardName(makeLocales(), 'en', 999)).toBe('Card 999')
  })

  it('falls back to English when current language is missing', () => {
    expect(getCardName(makeLocales(), 'de', 1)).toBe('Red Dragon')
  })

  it('returns placeholder when missing in both current and English', () => {
    expect(getCardName(makeLocales(), 'de', 999)).toBe('Card 999')
  })
})

describe('getCardDescription', () => {
  it('returns card description', () => {
    expect(getCardDescription(makeLocales(), 'en', 1)).toBe('A fierce dragon.')
  })

  it('returns empty string for missing card', () => {
    expect(getCardDescription(makeLocales(), 'en', 999)).toBe('')
  })
})

describe('getOpponentName', () => {
  it('returns opponent name', () => {
    expect(getOpponentName(makeLocales(), 'en', 1)).toBe('Liu Bei')
  })

  it('returns fallback for missing opponent', () => {
    expect(getOpponentName(makeLocales(), 'en', 999)).toBe('Opponent 999')
  })
})

describe('getOpponentField', () => {
  it('returns opponent title', () => {
    expect(getOpponentField(makeLocales(), 'en', 1, 'title')).toBe('Lord')
  })

  it('returns opponent flavor', () => {
    expect(getOpponentField(makeLocales(), 'en', 1, 'flavor')).toBe('Benevolent ruler.')
  })

  it('returns empty string for missing field', () => {
    expect(getOpponentField(makeLocales(), 'en', 999, 'name')).toBe('')
  })
})

describe('getShopName', () => {
  it('returns shop pack name', () => {
    expect(getShopName(makeLocales(), 'en', 'p1')).toBe('Starter Pack')
  })

  it('returns fallback for missing pack', () => {
    expect(getShopName(makeLocales(), 'en', 'missing')).toBe('Pack missing')
  })
})

describe('getCampaignText', () => {
  it('returns campaign text', () => {
    expect(getCampaignText(makeLocales(), 'en', 'ch1.intro')).toBe('Welcome to the battlefield!')
  })

  it('returns empty string for missing key', () => {
    expect(getCampaignText(makeLocales(), 'en', 'missing')).toBe('')
  })
})

describe('setLocaleField', () => {
  it('sets a new card locale entry', () => {
    const locales = makeLocales()
    const updated = setLocaleField(locales, 'en', 'cards', '2', { name: 'Blue Eyes', description: 'Powerful.' })
    expect(updated.en.cards['2']).toEqual({ name: 'Blue Eyes', description: 'Powerful.' })
    // Original unchanged
    expect(locales.en.cards['2']).toBeUndefined()
  })

  it('overwrites an existing entry', () => {
    const locales = makeLocales()
    const updated = setLocaleField(locales, 'en', 'cards', '1', { name: 'Updated Dragon', description: 'New desc.' })
    expect(updated.en.cards['1'].name).toBe('Updated Dragon')
  })

  it('creates language entry if missing', () => {
    const locales = makeLocales()
    const updated = setLocaleField(locales, 'de', 'cards', '1', { name: 'Roter Drache', description: 'Ein wilder Drache.' })
    expect(updated.de.cards['1'].name).toBe('Roter Drache')
  })
})

describe('deleteLocaleKey', () => {
  it('removes a key from a domain', () => {
    const locales = makeLocales()
    const updated = deleteLocaleKey(locales, 'en', 'cards', '1')
    expect(updated.en.cards['1']).toBeUndefined()
    // Original unchanged
    expect(locales.en.cards['1']).toBeDefined()
  })

  it('returns locales unchanged if language missing', () => {
    const locales = makeLocales()
    const updated = deleteLocaleKey(locales, 'de', 'cards', '1')
    expect(updated).toBe(locales)
  })
})

describe('getLanguages', () => {
  it('returns all language codes', () => {
    const locales = makeLocales()
    expect(getLanguages(locales)).toEqual(['en'])
  })

  it('returns multiple languages', () => {
    const locales = makeLocales()
    locales.de = createEmptyLocaleData()
    expect(getLanguages(locales)).toEqual(['en', 'de'])
  })
})
