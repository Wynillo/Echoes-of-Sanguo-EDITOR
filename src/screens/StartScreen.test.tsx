import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StartScreen from './StartScreen'
import '../i18n'

it('renders three action buttons', () => {
  render(<MemoryRouter><StartScreen /></MemoryRouter>)
  expect(screen.getByText(/Open Project Folder/i)).toBeInTheDocument()
  expect(screen.getByText(/New Project/i)).toBeInTheDocument()
  expect(screen.getByText(/Import .tcg/i)).toBeInTheDocument()
})
