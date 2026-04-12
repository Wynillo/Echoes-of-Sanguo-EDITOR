import { render, screen } from '@testing-library/react'
import { useProjectStore } from '../stores/projectStore'
import ValidationBanner from './ValidationBanner'

const VALID_CARD = { id: 1, type: 1, rarity: 4, level: 7, atk: 2400, def: 2000, attribute: 3, race: 1 }

it('returns null when cards are valid', () => {
  useProjectStore.getState().load({
    cards: [VALID_CARD],
    locales: { en: { common: {}, cards: { '1': { name: 'Test', description: '' } }, opponents: {}, shop: {}, campaign: {}, races: {}, attributes: {} } },
  } as any, null)
  const { container } = render(<ValidationBanner />)
  expect(container.firstChild).toBeNull()
})

it('shows error count when cards have validation errors', () => {
  // An invalid card (missing required fields) should trigger errors
  useProjectStore.getState().load({ cards: [{ id: 'bad' }] } as any, null)
  render(<ValidationBanner />)
  expect(screen.getByText(/validation error|warning/i)).toBeInTheDocument()
})
