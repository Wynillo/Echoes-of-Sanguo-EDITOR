// Mirror of @wynillo/tcg-format TcgCard but as mutable editor types
export interface EditorCard {
  id: number
  type: 1 | 2 | 3 | 4 | 5        // Monster/Fusion/Spell/Trap/Equipment
  rarity: 1 | 2 | 4 | 6 | 8
  level?: number
  atk?: number
  def?: number
  attribute?: 1 | 2 | 3 | 4 | 5 | 6
  race?: number
  atkBonus?: number
  defBonus?: number
  equipReqRace?: number
  equipReqAttr?: 1 | 2 | 3 | 4 | 5 | 6
  spellType?: 1 | 2 | 3 | 4
  effect?: string
  effects?: Array<{ trigger: string; actions: string[] }>
}

export interface EditorCardLocale {
  id: number
  name: string
  description: string
}

export interface EditorOpponent {
  id: number
  race?: number
  coinsWin: number
  coinsLoss: number
  deckIds: number[]
  behavior: 'default' | 'smart' | 'aggressive' | 'defensive' | 'cheating'
  name: string
  title: string
  flavor: string
}

export interface EditorCampaignNode {
  id: string
  type: 'duel' | 'story' | 'reward' | 'shop' | 'branch'
  storyId?: string
  duels?: number[]
  unlockConditions?: unknown[]
  rewards?: unknown[]
}

export interface EditorCampaignChapter {
  id: string
  title: string
  nodes: EditorCampaignNode[]
}

export interface EditorShopPack {
  id: string
  name: string
  cost: number
  drawCount: number
  cardPool: number[]
  unlockCondition?: string
}

export interface EditorFusionFormula {
  id: string
  operands: [number, number]   // two race IDs
  resultPool: number[]
  priority: number
}

export interface EditorRules {
  startingLP: number
  maxFieldZones: number
  deckSize: number
  cardCopyLimit: number
  cardsDrawPerTurn: number
  handLimit: number
}

export interface EditorModInfo {
  id: string
  name: string
  version: string
  author: string
  type: string
  description: string
  minEngineVersion: string
  formatVersion: number
}

export interface ProjectData {
  modInfo: EditorModInfo
  cards: EditorCard[]
  cardLocales: EditorCardLocale[]   // locales/en.json content
  opponents: EditorOpponent[]
  campaign: EditorCampaignChapter[]
  shop: EditorShopPack[]
  fusion: EditorFusionFormula[]
  rules: EditorRules
  // image blobs keyed by card id (loaded from img/)
  images: Record<number, Blob>
}
