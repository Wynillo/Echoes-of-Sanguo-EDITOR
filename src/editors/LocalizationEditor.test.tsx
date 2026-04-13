import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import LocalizationEditor from './LocalizationEditor'

beforeEach(() => useProjectStore.getState().load({
  locales: { en: { common: {}, cards: { '1': { name: 'Red Dragon', description: 'A fierce dragon.' } }, opponents: {}, shop: {}, campaign: {}, races: {}, attributes: {} } },
} as any))

it('renders card name in table', () => {
  render(<MemoryRouter><LocalizationEditor /></MemoryRouter>)
  expect(screen.getByDisplayValue('Red Dragon')).toBeInTheDocument()
})
