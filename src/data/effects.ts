// Action IDs from Echoes of Sanguo ENGINE effect-registry.ts
export const EFFECT_ACTION_IDS = [
  'dealDamage', 'gainLP', 'preventBattleDamage',
  'draw', 'drawThenDiscard', 'searchDeckToHand',
  'specialSummonFromDeck', 'shuffleGraveIntoDeck', 'peekTopCard',
  'bounceStrongestOpp', 'stealMonster', 'stealMonsterTemp',
  'buffField', 'debuffField', 'tempBuffField', 'tempDebuffField',
  'doubleAtk', 'halveAtk', 'swapAtkDef',
  'destroyAll', 'destroyAllOpp', 'destroyStrongestOpp', 'destroyWeakestOpp',
  'destroyAllSpellTraps', 'changePositionOpp',
  'reviveFromGrave', 'reviveFromEitherGrave',
  'sendTopCardsToGrave', 'salvageFromGrave',
  'createTokens', 'gameReset', 'skipOppDraw', 'preventAttacks',
  'passive_piercing', 'passive_indestructible',
  'passive_effectImmune', 'passive_directAttack',
] as const
