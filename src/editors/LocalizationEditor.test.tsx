import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import LocalizationEditor from './LocalizationEditor'

beforeEach(() => useProjectStore.getState().load({
  cardLocales: [{ id: 1, name: 'Red Dragon', description: 'A fierce dragon.' }],
} as any, null))

it('renders card name in table', () => {
  render(<MemoryRouter><LocalizationEditor /></MemoryRouter>)
  expect(screen.getByDisplayValue('Red Dragon')).toBeInTheDocument()
})
