import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import ModInfoEditor from './ModInfoEditor'

beforeEach(() => useProjectStore.getState().load({
  modInfo: { id: 'test-mod', name: 'Test MOD', version: '1.0.0', author: 'Dev',
    type: 'expansion', description: '', minEngineVersion: '1.0.0', formatVersion: 2 },
} as any))

it('renders mod name field', () => {
  render(<MemoryRouter><ModInfoEditor /></MemoryRouter>)
  expect(screen.getByDisplayValue('Test MOD')).toBeInTheDocument()
})
