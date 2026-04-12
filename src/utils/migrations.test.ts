import { describe, it, expect } from 'vitest'
import { migrateProjectData } from './migrations'

describe('migrateProjectData', () => {
  it('migrates cardLocales array to locales.en.cards', () => {
    const old = {
      cards: [{ id: 1, type: 1, rarity: 1 }],
      cardLocales: [
        { id: 1, name: 'Red Dragon', description: 'A fierce dragon.' },
        { id: 2, name: 'Blue Knight', description: 'A brave knight.' },
      ],
    }
    const result = migrateProjectData(old)
    expect(result.locales).toBeDefined()
    expect(result.locales!.en.cards['1']).toEqual({ name: 'Red Dragon', description: 'A fierce dragon.' })
    expect(result.locales!.en.cards['2']).toEqual({ name: 'Blue Knight', description: 'A brave knight.' })
    expect((result as any).cardLocales).toBeUndefined()
  })

  it('extracts opponent name/title/flavor into locales.en.opponents', () => {
    const old = {
      cardLocales: [],
      opponents: [
        { id: 1, name: 'Liu Bei', title: 'Lord', flavor: 'Benevolent.', coinsWin: 200, coinsLoss: 0, deckIds: [], behavior: 'default' },
        { id: 2, name: 'Cao Cao', title: 'Warlord', flavor: 'Cunning.', coinsWin: 300, coinsLoss: 0, deckIds: [], behavior: 'smart' },
      ],
    }
    const result = migrateProjectData(old)
    expect(result.locales!.en.opponents['1']).toEqual({ name: 'Liu Bei', title: 'Lord', flavor: 'Benevolent.' })
    expect(result.locales!.en.opponents['2']).toEqual({ name: 'Cao Cao', title: 'Warlord', flavor: 'Cunning.' })
  })

  it('strips name/title/flavor from opponents', () => {
    const old = {
      cardLocales: [],
      opponents: [
        { id: 1, name: 'Liu Bei', title: 'Lord', flavor: 'Benevolent.', coinsWin: 200, coinsLoss: 0, deckIds: [], behavior: 'default' },
      ],
    }
    const result = migrateProjectData(old)
    const opp = result.opponents![0] as any
    expect(opp.name).toBeUndefined()
    expect(opp.title).toBeUndefined()
    expect(opp.flavor).toBeUndefined()
    expect(opp.id).toBe(1)
    expect(opp.coinsWin).toBe(200)
  })

  it('migrates campaign duels[] to opponentId', () => {
    const old = {
      campaign: [{
        id: 'ch1',
        title: 'Chapter One',
        nodes: [
          { id: 'n1', type: 'duel', duels: [5], unlockConditions: ['cleared_intro'] },
          { id: 'n2', type: 'story' },
        ],
      }],
    }
    const result = migrateProjectData(old)
    const node0 = result.campaign![0].nodes[0]
    expect(node0.opponentId).toBe(5)
    expect((node0 as any).duels).toBeUndefined()
    expect(node0.unlockCondition).toBe('cleared_intro')
    // Story node untouched
    const node1 = result.campaign![0].nodes[1]
    expect(node1.type).toBe('story')
    expect(node1.opponentId).toBeUndefined()
  })

  it('adds currencies and starterDecks defaults if missing', () => {
    const result = migrateProjectData({})
    expect(result.currencies).toEqual([])
    expect(result.starterDecks).toEqual([])
  })

  it('passes through already-migrated data unchanged', () => {
    const alreadyMigrated = {
      locales: {
        en: {
          common: {},
          cards: { '1': { name: 'Test', description: 'Desc' } },
          opponents: { '1': { name: 'Opp', title: 'T', flavor: 'F' } },
          shop: {},
          campaign: {},
          races: {},
          attributes: {},
        },
      },
      opponents: [{ id: 1, coinsWin: 100, coinsLoss: 0, deckIds: [], behavior: 'default' }],
      campaign: [{
        id: 'ch1',
        title: 'Chapter One',
        nodes: [{ id: 'n1', type: 'duel', opponentId: 1 }],
      }],
      currencies: [{ id: 'gold', nameKey: 'Gold', icon: 'coin' }],
      starterDecks: [{ raceId: 1, cardIds: [1, 2] }],
    }
    const result = migrateProjectData(alreadyMigrated)
    // locales preserved (not overwritten since cardLocales is absent)
    expect(result.locales!.en.cards['1'].name).toBe('Test')
    // currencies/starterDecks preserved
    expect(result.currencies).toHaveLength(1)
    expect(result.starterDecks).toHaveLength(1)
    // campaign nodes unchanged (opponentId already set, no duels)
    expect(result.campaign![0].nodes[0].opponentId).toBe(1)
  })
})
