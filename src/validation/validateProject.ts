import type { ProjectData } from '../types/project'

export interface ValidationIssue {
  domain: string
  entityId: string | number
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export function validateProject(data: ProjectData): ValidationResult {
  const issues: ValidationIssue[] = []
  const cardIds = new Set(data.cards.map((c) => c.id))
  const oppIds = new Set(data.opponents.map((o) => o.id))
  const raceIds = new Set(data.races.map((r) => r.id))
  const currencyIds = new Set(data.currencies.map((c) => c.id))

  // Opponent validations
  for (const opp of data.opponents) {
    for (const deckId of opp.deckIds) {
      if (!cardIds.has(deckId)) {
        issues.push({ domain: 'opponents', entityId: opp.id, message: `Opponent ${opp.id} deck references non-existent card ${deckId}`, severity: 'error' })
      }
    }
    if (opp.currencyId && !currencyIds.has(opp.currencyId)) {
      issues.push({ domain: 'opponents', entityId: opp.id, message: `Opponent ${opp.id} references non-existent currency "${opp.currencyId}"`, severity: 'error' })
    }
  }

  // Shop validations
  for (const pack of data.shop) {
    for (const cardId of pack.cardPool ?? []) {
      if (!cardIds.has(cardId)) {
        issues.push({ domain: 'shop', entityId: pack.id, message: `Pack "${pack.id}" card pool references non-existent card ${cardId}`, severity: 'error' })
      }
    }
    if (pack.currencyId && !currencyIds.has(pack.currencyId)) {
      issues.push({ domain: 'shop', entityId: pack.id, message: `Pack "${pack.id}" references non-existent currency "${pack.currencyId}"`, severity: 'error' })
    }
  }

  // Fusion validations
  for (const formula of data.fusion) {
    for (const cardId of formula.resultPool) {
      if (!cardIds.has(cardId)) {
        issues.push({ domain: 'fusion', entityId: formula.id, message: `Fusion "${formula.id}" result pool references non-existent card ${cardId}`, severity: 'error' })
      }
    }
    for (const raceId of formula.operands) {
      if (!raceIds.has(raceId)) {
        issues.push({ domain: 'fusion', entityId: formula.id, message: `Fusion "${formula.id}" operand references non-existent race ${raceId}`, severity: 'error' })
      }
    }
  }

  // Campaign validations
  for (const chapter of data.campaign) {
    for (const node of chapter.nodes) {
      if ((node.type === 'duel' || node.type === 'duel_elite' || node.type === 'boss') && node.opponentId != null) {
        if (!oppIds.has(node.opponentId)) {
          issues.push({ domain: 'campaign', entityId: node.id, message: `Campaign node "${node.id}" references non-existent opponent ${node.opponentId}`, severity: 'error' })
        }
      }
      if (node.type === 'gauntlet' && node.opponentSequence) {
        for (const oppId of node.opponentSequence) {
          if (!oppIds.has(oppId)) {
            issues.push({ domain: 'campaign', entityId: node.id, message: `Gauntlet node "${node.id}" references non-existent opponent ${oppId}`, severity: 'error' })
          }
        }
      }
    }
  }

  // Starter deck validations
  for (const deck of data.starterDecks) {
    if (!raceIds.has(deck.raceId)) {
      issues.push({ domain: 'starterDecks', entityId: deck.raceId, message: `Starter deck references non-existent race ${deck.raceId}`, severity: 'error' })
    }
    for (const cardId of deck.cardIds) {
      if (!cardIds.has(cardId)) {
        issues.push({ domain: 'starterDecks', entityId: deck.raceId, message: `Starter deck for race ${deck.raceId} references non-existent card ${cardId}`, severity: 'error' })
      }
    }
  }

  // Locale warnings: cards without locale entries
  const languages = Object.keys(data.locales)
  for (const lang of languages) {
    const localeData = data.locales[lang]
    if (!localeData) continue
    for (const card of data.cards) {
      if (!localeData.cards[String(card.id)]) {
        issues.push({ domain: 'cards', entityId: card.id, message: `Card ${card.id} missing locale entry for language "${lang}"`, severity: 'warning' })
      }
    }

    // Opponents without locale entries
    for (const opp of data.opponents) {
      if (!localeData.opponents[String(opp.id)]) {
        issues.push({ domain: 'opponents', entityId: opp.id, message: `Opponent ${opp.id} missing locale entry for language "${lang}"`, severity: 'warning' })
      }
    }

    // Shop packs without locale entries
    for (const pack of data.shop) {
      if (!localeData.shop[pack.id]) {
        issues.push({ domain: 'shop', entityId: pack.id, message: `Shop pack "${pack.id}" missing locale entry for language "${lang}"`, severity: 'warning' })
      }
    }
  }

  return {
    errors: issues.filter((i) => i.severity === 'error'),
    warnings: issues.filter((i) => i.severity === 'warning'),
  }
}
