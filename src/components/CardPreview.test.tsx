import { render, screen } from '@testing-library/react'
import CardPreview from './CardPreview'
import type { EditorCard, EditorCardLocale } from '../types/project'

const card: EditorCard = { id: 1, type: 1, rarity: 4, level: 7, atk: 2400, def: 2000, attribute: 3, race: 1 }
const locale: EditorCardLocale = { id: 1, name: 'Red Dragon', description: 'A fierce dragon.' }

it('renders card name and stats', () => {
  render(<CardPreview card={card} locale={locale} image={null} />)
  expect(screen.getByText('Red Dragon')).toBeInTheDocument()
  expect(screen.getByText('2400')).toBeInTheDocument()
  expect(screen.getByText('2000')).toBeInTheDocument()
})
