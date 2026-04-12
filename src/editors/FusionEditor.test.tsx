import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import FusionEditor from './FusionEditor'

beforeEach(() => useProjectStore.getState().load({
  fusion: [{ id: 'f1', operands: [1, 2], resultPool: [], priority: 1 }],
  cards: [],
  locales: { en: { common: {}, cards: {}, opponents: {}, shop: {}, campaign: {}, races: {}, attributes: {} } },
} as any, null))

it('renders fusion formulas section', () => {
  render(<MemoryRouter><FusionEditor /></MemoryRouter>)
  expect(screen.getByText('Fusion Formulas')).toBeInTheDocument()
})
