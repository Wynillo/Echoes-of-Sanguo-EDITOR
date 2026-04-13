import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import CardEditor from './CardEditor'

beforeEach(() => useProjectStore.getState().load({
  cards: [{ id: 1, type: 1, rarity: 1, atk: 1000, def: 800 }],
  locales: { en: { common: {}, cards: { '1': { name: 'Test Card', description: 'A test.' } }, opponents: {}, shop: {}, campaign: {}, races: {}, attributes: {} } },
} as any))

it('shows card name in input', () => {
  render(
    <MemoryRouter initialEntries={['/project/cards/1']}>
      <Routes><Route path="/project/:section/:id" element={<CardEditor />} /></Routes>
    </MemoryRouter>
  )
  expect(screen.getByDisplayValue('Test Card')).toBeInTheDocument()
})
