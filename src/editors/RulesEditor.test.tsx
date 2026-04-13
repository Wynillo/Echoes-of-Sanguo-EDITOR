import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import RulesEditor from './RulesEditor'

beforeEach(() => useProjectStore.getState().load({
  rules: { startingLP: 8000, maxFieldZones: 5, deckSize: 40, cardCopyLimit: 3, cardsDrawPerTurn: 1, handLimit: 8 },
} as any))

it('renders starting LP field', () => {
  render(<MemoryRouter><RulesEditor /></MemoryRouter>)
  expect(screen.getByDisplayValue('8000')).toBeInTheDocument()
})
