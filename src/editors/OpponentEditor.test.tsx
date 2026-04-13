import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import OpponentEditor from './OpponentEditor'

beforeEach(() => useProjectStore.getState().load({
  opponents: [{ id: 1, coinsWin: 200, coinsLoss: 0, deckIds: [], behavior: 'default' }],
  cards: [],
  locales: { en: { common: {}, cards: {}, opponents: { '1': { name: 'Liu Bei', title: 'Lord', flavor: '' } }, shop: {}, campaign: {}, races: {}, attributes: {} } },
} as any))

it('renders opponent name', () => {
  render(
    <MemoryRouter initialEntries={['/project/opponents/1']}>
      <Routes><Route path="/project/:section/:id" element={<OpponentEditor />} /></Routes>
    </MemoryRouter>
  )
  expect(screen.getByDisplayValue('Liu Bei')).toBeInTheDocument()
})
