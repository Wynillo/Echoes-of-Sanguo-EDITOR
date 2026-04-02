import { create } from 'zustand'
import type { ProjectData, EditorCard } from '../types/project'

const DEFAULT_RULES = {
  startingLP: 8000, maxFieldZones: 5, deckSize: 40,
  cardCopyLimit: 3, cardsDrawPerTurn: 1, handLimit: 8,
}

const EMPTY_DATA: ProjectData = {
  modInfo: { id: '', name: '', version: '1.0.0', author: '', type: 'expansion',
    description: '', minEngineVersion: '1.0.0', formatVersion: 2 },
  cards: [], cardLocales: [], opponents: [],
  campaign: [], shop: [], fusion: [],
  rules: DEFAULT_RULES, images: {},
}

interface ProjectStore {
  isLoaded: boolean
  data: ProjectData
  dirHandle: FileSystemDirectoryHandle | null
  load: (data: Partial<ProjectData>, dir: FileSystemDirectoryHandle | null) => void
  reset: () => void
  updateCard: (id: number, patch: Partial<EditorCard>) => void
  setCards: (cards: EditorCard[]) => void
  setData: <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  isLoaded: false,
  data: EMPTY_DATA,
  dirHandle: null,

  load: (data, dir) => set({
    isLoaded: true,
    dirHandle: dir,
    data: { ...EMPTY_DATA, ...data },
  }),

  reset: () => set({ isLoaded: false, data: EMPTY_DATA, dirHandle: null }),

  updateCard: (id, patch) => set((s) => ({
    data: {
      ...s.data,
      cards: s.data.cards.map((c) => c.id === id ? { ...c, ...patch } : c),
    },
  })),

  setCards: (cards) => set((s) => ({ data: { ...s.data, cards } })),

  setData: (key, value) => set((s) => ({ data: { ...s.data, [key]: value } })),
}))
