import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import ShopEditor from './ShopEditor'

beforeEach(() => useProjectStore.getState().load({
  shop: [{ id: 'p1', name: 'Starter Pack', cost: 100, drawCount: 5, cardPool: [] }],
  cards: [], cardLocales: [],
} as any, null))

it('renders pack name', () => {
  render(<MemoryRouter><ShopEditor /></MemoryRouter>)
  expect(screen.getByDisplayValue('Starter Pack')).toBeInTheDocument()
})
