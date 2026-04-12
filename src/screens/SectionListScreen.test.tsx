import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import SectionListScreen from './SectionListScreen'
import '../i18n'

beforeEach(() => {
  useProjectStore.getState().load({
    cards: [{ id: 1, type: 1, rarity: 1, atk: 2400 } as any],
    locales: { en: { common: {}, cards: { '1': { name: 'Red Dragon', description: '' } }, opponents: {}, shop: {}, campaign: {}, races: {}, attributes: {} } },
  } as any, null)
})

it('renders card name in list', () => {
  render(
    <MemoryRouter initialEntries={['/project/cards']}>
      <Routes>
        <Route path="/project/:section" element={<SectionListScreen />} />
      </Routes>
    </MemoryRouter>
  )
  expect(screen.getByText('Red Dragon')).toBeInTheDocument()
})
