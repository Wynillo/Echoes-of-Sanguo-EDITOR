import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import CampaignEditor from './CampaignEditor'

beforeEach(() => useProjectStore.getState().load({
  campaign: [{ id: 'ch1', title: 'Chapter One', nodes: [
    { id: 'n1', type: 'duel', duels: [1], unlockConditions: [], rewards: [] }
  ]}],
} as any, null))

it('renders chapter title', () => {
  render(<MemoryRouter><CampaignEditor /></MemoryRouter>)
  expect(screen.getByText('Chapter One')).toBeInTheDocument()
})
