import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './projectStore'

describe('projectStore', () => {
  beforeEach(() => useProjectStore.getState().reset())

  it('starts with no project loaded', () => {
    expect(useProjectStore.getState().isLoaded).toBe(false)
  })

  it('loads project data', () => {
    const { load } = useProjectStore.getState()
    load({ cards: [{ id: 1, type: 1, rarity: 1 }] } as any, null as any)
    expect(useProjectStore.getState().isLoaded).toBe(true)
    expect(useProjectStore.getState().data.cards).toHaveLength(1)
  })

  it('updates a card by id', () => {
    const { load, updateCard } = useProjectStore.getState()
    load({ cards: [{ id: 1, type: 1, rarity: 1, atk: 1000 }] } as any, null as any)
    updateCard(1, { atk: 2000 })
    expect(useProjectStore.getState().data.cards[0].atk).toBe(2000)
  })
})
