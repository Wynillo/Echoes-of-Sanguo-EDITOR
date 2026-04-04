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

  it('seeds EMPTY_DATA with 6 default attributes', () => {
    const { data } = useProjectStore.getState()
    expect(data.attributes).toHaveLength(6)
    expect(data.attributes[0]).toMatchObject({ id: 1, key: 'Light', value: 'Light', color: '#c09000' })
  })

  it('seeds EMPTY_DATA with 12 default races', () => {
    const { data } = useProjectStore.getState()
    expect(data.races).toHaveLength(12)
    expect(data.races[0]).toMatchObject({ id: 1, key: 'Dragon', value: 'Dragon', color: '#8040c0' })
  })

  it('load merges custom attributes over defaults', () => {
    const { load } = useProjectStore.getState()
    const custom = [{ id: 1, key: 'Void', value: 'Void', color: '#000000' }]
    load({ attributes: custom } as any, null as any)
    expect(useProjectStore.getState().data.attributes).toHaveLength(1)
    expect(useProjectStore.getState().data.attributes[0].key).toBe('Void')
  })
})
