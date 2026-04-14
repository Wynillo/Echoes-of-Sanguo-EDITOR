// Mirror of @wynillo/tcg-format TcgCard but as mutable editor types
export interface EditorCard {
  id: number
  type: 1 | 2 | 3 | 4 | 5        // Monster/Fusion/Spell/Trap/Equipment
  rarity: 1 | 2 | 4 | 6 | 8
  level?: number
  atk?: number
  def?: number
  attribute?: number               // loosened from 1|2|3|4|5|6 union
  race?: number
  atkBonus?: number
  defBonus?: number
  equipReqRace?: number
  equipReqAttr?: number            // loosened from 1|2|3|4|5|6 union
  spellType?: 1 | 2 | 3 | 4
  effect?: string
  effects?: Array<{ trigger: string; actions: string[] }>
}

/** @deprecated Use locales system instead */
export interface EditorCardLocale {
  id: number
  name: string
  description: string
}

// --- Locale system (matches MOD-base format) ---

export interface LocaleData {
  common: Record<string, string>
  cards: Record<string, { name: string; description: string }>
  opponents: Record<string, { name: string; title: string; flavor: string }>
  shop: Record<string, { name: string; desc: string }>
  campaign: Record<string, string>
  races: Record<string, string>
  attributes: Record<string, string>
}

// --- Currency ---

export interface EditorCurrency {
  id: string
  nameKey: string
  icon: string
  requiredChapter?: number
}

// --- Starter Deck ---

export interface EditorStarterDeck {
  raceId: number
  cardIds: number[]
}

// --- Opponent ---

export interface EditorOpponent {
  id: number
  race?: number
  coinsWin: number
  coinsLoss: number
  deckIds: number[]
  behavior: 'default' | 'smart' | 'aggressive' | 'defensive' | 'cheating'
  currencyId?: string
  unlockCondition?: string
}

// --- Campaign ---

export interface EditorCampaignNode {
  id: string
  type: 'duel' | 'duel_elite' | 'boss' | 'story' | 'reward' | 'shop' | 'branch' | 'rest' | 'treasure' | 'gauntlet'
  opponentId?: number
  opponentSequence?: number[]
  isBoss?: boolean
  storyId?: string
  unlockCondition?: unknown
  rewards?: unknown
  position?: { x: number; y: number }
}

export interface EditorCampaignChapter {
  id: string
  title: string
  nodes: EditorCampaignNode[]
}

// --- Shop ---

export interface EditorShopPack {
  id: string
  name: string
  cost: number
  drawCount: number
  cardPool: number[]
  currencyId?: string
  unlockCondition?: string
}

// --- Fusion ---

export interface EditorFusionFormula {
  id: string
  operands: [number, number]   // two race IDs
  resultPool: number[]
  priority: number
}

// --- Rules ---

export interface EditorRules {
  startingLP: number
  maxFieldZones: number
  deckSize: number
  cardCopyLimit: number
  cardsDrawPerTurn: number
  handLimit: number
}

// --- Mod Info ---

export interface EditorModInfo {
  id: string
  name: string
  version: string
  author: string
  type: string
  description: string
}

// --- Attribute & Race ---

export interface EditorAttribute {
  id: number
  key: string
  value: string
  color: string
  symbol?: string
}

export interface EditorRace {
  id: number
  key: string
  value: string
  color: string
  icon?: string
  emoji?: string
}

// --- Project Data ---

export interface ProjectData {
  modInfo: EditorModInfo
  cards: EditorCard[]
  locales: Record<string, LocaleData>
  opponents: EditorOpponent[]
  campaign: EditorCampaignChapter[]
  shop: EditorShopPack[]
  fusion: EditorFusionFormula[]
  rules: EditorRules
  attributes: EditorAttribute[]
  races: EditorRace[]
  currencies: EditorCurrency[]
  starterDecks: EditorStarterDeck[]
  images: Record<number, Blob>
}
