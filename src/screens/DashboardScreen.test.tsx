import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import DashboardScreen from './DashboardScreen'
import '../i18n'

beforeEach(() => {
  useProjectStore.getState().load(
    {
      modInfo: { id: 'test', name: 'Test MOD', version: '1.0.0', author: 'Dev',
        type: 'expansion', description: '', minEngineVersion: '1.0.0', formatVersion: 2 },
      cards: [{} as any, {} as any, {} as any],
    },
  )
})

it('shows MOD name and card count', () => {
  render(<MemoryRouter><DashboardScreen /></MemoryRouter>)
  expect(screen.getByText(/Test MOD/i)).toBeInTheDocument()
  expect(screen.getByText(/3/)).toBeInTheDocument()
})
