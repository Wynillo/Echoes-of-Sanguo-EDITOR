import { create } from 'zustand'
import type { ProjectData, EditorCard, EditorAttribute, EditorRace, LocaleData } from '../types/project'
import { createEmptyLocaleData } from '../utils/localeHelpers'
import { loadProject, deleteProject } from '../db/indexedDb'
import { setLastProjectId, getLastProjectId, clearLastProjectId } from '../autosave'

export const DEFAULT_RULES = {
  startingLP: 8000,
  maxFieldZones: 5,
  deckSize: 40,
  cardCopyLimit: 3,
  cardsDrawPerTurn: 1,
  handLimit: 8,
}

export const DEFAULT_ATTRIBUTES: EditorAttribute[] = [
  { id: 1,  key: 'Light', value: 'Light', color: '#c09000', symbol: '☀' },
  { id: 2,  key: 'Dark',  value: 'Dark',  color: '#7020a0', symbol: '☽' },
  { id: 3,  key: 'Fire',  value: 'Fire',  color: '#c0300a', symbol: '♨' },
  { id: 4,  key: 'Water', value: 'Water', color: '#1a6aaa', symbol: '◎' },
  { id: 5,  key: 'Earth', value: 'Earth', color: '#6a7030', symbol: '◆' },
  { id: 6,  key: 'Wind',  value: 'Wind',  color: '#4a6080', symbol: '∿' },
]

export const DEFAULT_RACES: EditorRace[] = [
  { id: 1,  key: 'Dragon',      value: 'Dragon',      color: '#8040c0', icon: 'GiDragonHead',    emoji: '🐲' },
  { id: 2,  key: 'Spellcaster', value: 'Spellcaster', color: '#6060c0', icon: 'GiWizardStaff',   emoji: '🔮' },
  { id: 3,  key: 'Warrior',     value: 'Warrior',     color: '#c09030', icon: 'GiSwordman',      emoji: '⚔️' },
  { id: 4,  key: 'Beast',       value: 'Beast',       color: '#e07030', icon: 'GiMechanicHead',  emoji: '🐅' },
  { id: 5,  key: 'Plant',       value: 'Plant',       color: '#40a050', icon: 'GiTreeface',      emoji: '🌿' },
  { id: 6,  key: 'Rock',        value: 'Rock',        color: '#808060', icon: 'GiRock',          emoji: '🪨' },
  { id: 7,  key: 'Phoenix',     value: 'Phoenix',     color: '#e06020', icon: 'GiFlame',         emoji: '🔥' },
  { id: 8,  key: 'Undead',      value: 'Undead',      color: '#804090', icon: 'GiSkull',         emoji: '💀' },
  { id: 9,  key: 'Aqua',        value: 'Aqua',        color: '#3080b0', icon: 'GiWater',         emoji: '🌊' },
  { id: 10, key: 'Insect',      value: 'Insect',      color: '#90a040', icon: 'GiButterfly',     emoji: '🦋' },
  { id: 11, key: 'Machine',     value: 'Machine',     color: '#708090', icon: 'GiMechanicalArm', emoji: '⚙️' },
  { id: 12, key: 'Pyro',        value: 'Pyro',        color: '#c03010', icon: 'GiFire',          emoji: '♨'  },
]

const EMPTY_DATA: ProjectData = {
  modInfo: { id: '', name: '', version: '1.0.0', author: '', type: 'expansion',
    description: '' },
  cards: [],
  locales: { en: createEmptyLocaleData() },
  opponents: [],
  campaign: [], shop: [], fusion: [],
  rules: DEFAULT_RULES,
  attributes: DEFAULT_ATTRIBUTES,
  races: DEFAULT_RACES,
  currencies: [],
  starterDecks: [],
  images: {},
}

interface ProjectStore {
  isLoaded: boolean
  data: ProjectData
  load: (data: Partial<ProjectData>) => void
  reset: () => void
  updateCard: (id: number, patch: Partial<EditorCard>) => void
  setCards: (cards: EditorCard[]) => void
  setData: <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => void
  setLocaleField: <D extends keyof LocaleData>(lang: string, domain: D, key: string, value: LocaleData[D][string]) => void
  mergeLocaleData: (lang: string, newData: LocaleData) => void
  setOpponents: (opponents: any[]) => void
  setCampaign: (campaign: any[]) => void
  setShop: (shop: any[]) => void
  setFusion: (fusion: any[]) => void
  setStarterDecks: (decks: any[]) => void
  setCurrencies: (currencies: any[]) => void
  loadFromIndexedDB: (id: string) => Promise<void>
  deleteFromIndexedDB: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set) => ({
  isLoaded: false,
  data: EMPTY_DATA,

  load: (data) => {
    set({ isLoaded: true, data: { ...EMPTY_DATA, ...data } })
    if (data.modInfo?.id) setLastProjectId(data.modInfo.id)
  },

  reset: () => { clearLastProjectId(); set({ isLoaded: false, data: EMPTY_DATA }) },

  updateCard: (id, patch) => set((s) => ({
    data: {
      ...s.data,
      cards: s.data.cards.map((c) => c.id === id ? { ...c, ...patch } : c),
    },
  })),

  setCards: (cards) => set((s) => ({ data: { ...s.data, cards } })),

  setData: (key, value) => set((s) => ({ data: { ...s.data, [key]: value } })),

  setLocaleField: (lang, domain, key, value) => set((s) => {
    const langData = s.data.locales[lang] ?? createEmptyLocaleData()
    const domainData = langData[domain] as Record<string, unknown>
    return {
      data: {
        ...s.data,
        locales: {
          ...s.data.locales,
          [lang]: {
            ...langData,
            [domain]: { ...domainData, [key]: value },
          },
        },
      },
    }
  }),

  mergeLocaleData: (lang, newData) => set((s) => {
    const current = s.data.locales[lang] ?? createEmptyLocaleData()
    const merged: LocaleData = {
      common: { ...current.common, ...newData.common },
      cards: { ...current.cards, ...newData.cards },
      opponents: { ...current.opponents, ...newData.opponents },
      shop: { ...current.shop, ...newData.shop },
      campaign: { ...current.campaign, ...newData.campaign },
      races: { ...current.races, ...newData.races },
      attributes: { ...current.attributes, ...newData.attributes },
    }
    return {
      data: {
        ...s.data,
        locales: {
          ...s.data.locales,
          [lang]: merged,
        },
      },
    }
  }),

  setOpponents: (opponents) => set((s) => ({ data: { ...s.data, opponents } })),
  setCampaign: (campaign) => set((s) => ({ data: { ...s.data, campaign } })),
  setShop: (shop) => set((s) => ({ data: { ...s.data, shop } })),
  setFusion: (fusion) => set((s) => ({ data: { ...s.data, fusion } })),
  setStarterDecks: (starterDecks) => set((s) => ({ data: { ...s.data, starterDecks } })),
  setCurrencies: (currencies) => set((s) => ({ data: { ...s.data, currencies } })),

  loadFromIndexedDB: async (id) => {
    const data = await loadProject(id)
    if (data) {
      set({ isLoaded: true, data: { ...EMPTY_DATA, ...data } })
      setLastProjectId(id)
    }
  },

  deleteFromIndexedDB: async (id) => {
    await deleteProject(id)
    if (getLastProjectId() === id) clearLastProjectId()
  },
}))
