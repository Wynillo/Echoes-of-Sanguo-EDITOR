import { describe, it, expect } from 'vitest'
import { validateProject } from './validateProject'
import type { ProjectData } from '../types/project'
import { createEmptyLocaleData } from '../utils/localeHelpers'

function makeData(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    modInfo: { id: 'test', name: 'Test', version: '1.0.0', author: 'Dev', type: 'expansion', description: '', minEngineVersion: '1.0.0', formatVersion: 2 },
    cards: [{ id: 1, type: 1, rarity: 1 }, { id: 2, type: 1, rarity: 1 }],
    locales: { en: createEmptyLocaleData() },
    opponents: [{ id: 1, coinsWin: 100, coinsLoss: 0, deckIds: [1], behavior: 'default' as const }],
    campaign: [],
    shop: [],
    fusion: [],
    rules: { startingLP: 8000, maxFieldZones: 5, deckSize: 40, cardCopyLimit: 3, cardsDrawPerTurn: 1, handLimit: 8 },
    attributes: [{ id: 1, key: 'Light', value: 'Light', color: '#c09000' }],
    races: [{ id: 1, key: 'Dragon', value: 'Dragon', color: '#8040c0' }],
    currencies: [{ id: 'gold', nameKey: 'Gold', icon: 'coin' }],
    starterDecks: [],
    images: {},
    ...overrides,
  }
}

describe('validateProject', () => {
  it('returns no errors for valid data', () => {
    const result = validateProject(makeData())
    expect(result.errors).toHaveLength(0)
  })

  describe('opponent validations', () => {
    it('reports error when opponent deckIds reference non-existent card', () => {
      const data = makeData({
        opponents: [{ id: 1, coinsWin: 100, coinsLoss: 0, deckIds: [999], behavior: 'default' }],
      })
      const result = validateProject(data)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].domain).toBe('opponents')
      expect(result.errors[0].message).toContain('999')
    })

    it('reports error when opponent references non-existent currency', () => {
      const data = makeData({
        opponents: [{ id: 1, coinsWin: 100, coinsLoss: 0, deckIds: [1], behavior: 'default', currencyId: 'gems' }],
      })
      const result = validateProject(data)
      expect(result.errors.some(e => e.message.includes('gems'))).toBe(true)
    })
  })

  describe('shop validations', () => {
    it('reports error when shop cardPool references non-existent card', () => {
      const data = makeData({
        shop: [{ id: 'p1', name: 'Pack', cost: 100, drawCount: 5, cardPool: [999] }],
      })
      const result = validateProject(data)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].domain).toBe('shop')
      expect(result.errors[0].message).toContain('999')
    })

    it('reports error when shop references non-existent currency', () => {
      const data = makeData({
        shop: [{ id: 'p1', name: 'Pack', cost: 100, drawCount: 5, cardPool: [1], currencyId: 'gems' }],
      })
      const result = validateProject(data)
      expect(result.errors.some(e => e.message.includes('gems'))).toBe(true)
    })
  })

  describe('fusion validations', () => {
    it('reports error when fusion resultPool references non-existent card', () => {
      const data = makeData({
        fusion: [{ id: 'f1', operands: [1, 1] as [number, number], resultPool: [999], priority: 1 }],
      })
      const result = validateProject(data)
      expect(result.errors.some(e => e.domain === 'fusion' && e.message.includes('999'))).toBe(true)
    })

    it('reports error when fusion operand references non-existent race', () => {
      const data = makeData({
        fusion: [{ id: 'f1', operands: [1, 99] as [number, number], resultPool: [1], priority: 1 }],
      })
      const result = validateProject(data)
      expect(result.errors.some(e => e.domain === 'fusion' && e.message.includes('99'))).toBe(true)
    })
  })

  describe('campaign validations', () => {
    it('reports error when campaign opponentId references non-existent opponent', () => {
      const data = makeData({
        campaign: [{ id: 'ch1', title: 'Chapter One', nodes: [
          { id: 'n1', type: 'duel' as const, opponentId: 999 },
        ]}],
      })
      const result = validateProject(data)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].domain).toBe('campaign')
      expect(result.errors[0].message).toContain('999')
    })

    it('reports error when gauntlet opponentSequence references non-existent opponent', () => {
      const data = makeData({
        campaign: [{ id: 'ch1', title: 'Chapter One', nodes: [
          { id: 'n1', type: 'gauntlet' as const, opponentSequence: [1, 888] },
        ]}],
      })
      const result = validateProject(data)
      expect(result.errors.some(e => e.message.includes('888'))).toBe(true)
    })
  })

  describe('starter deck validations', () => {
    it('reports error when starter deck references non-existent race', () => {
      const data = makeData({
        starterDecks: [{ raceId: 999, cardIds: [1] }],
      })
      const result = validateProject(data)
      expect(result.errors.some(e => e.domain === 'starterDecks' && e.message.includes('999'))).toBe(true)
    })

    it('reports error when starter deck cardIds reference non-existent card', () => {
      const data = makeData({
        starterDecks: [{ raceId: 1, cardIds: [1, 888] }],
      })
      const result = validateProject(data)
      expect(result.errors.some(e => e.domain === 'starterDecks' && e.message.includes('888'))).toBe(true)
    })
  })

  describe('locale warnings', () => {
    it('warns when a card is missing locale entry', () => {
      const data = makeData()
      // cards [1, 2] but locales.en.cards is empty
      const result = validateProject(data)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0].severity).toBe('warning')
      expect(result.warnings[0].domain).toBe('cards')
    })

    it('no locale warning when all cards have entries', () => {
      const data = makeData({
        locales: {
          en: {
            ...createEmptyLocaleData(),
            cards: {
              '1': { name: 'Card 1', description: '' },
              '2': { name: 'Card 2', description: '' },
            },
          },
        },
      })
      const result = validateProject(data)
      expect(result.warnings.filter(w => w.domain === 'cards')).toHaveLength(0)
    })
  })
})
