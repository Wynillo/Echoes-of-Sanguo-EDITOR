import type { EditorCurrency, EditorOpponent, LocaleData } from '../types/project'

/**
 * Auto-create missing currencies referenced by shop packs and opponents
 */
export function autoCreateMissingCurrencies(
  shopPacks: Array<{ currencyId?: string }>,
  opponents: Array<{ currencyId?: string }>,
  existingCurrencies: EditorCurrency[],
  locales: Record<string, LocaleData>
): EditorCurrency[] {
  const existingIds = new Set(existingCurrencies.map(c => c.id))
  const referencedIds = new Set<string>()

  // Collect all referenced currency IDs
  for (const pack of shopPacks) {
    if (pack.currencyId) referencedIds.add(pack.currencyId)
  }
  for (const opp of opponents) {
    if (opp.currencyId) referencedIds.add(opp.currencyId)
  }

  // Default currency definitions matching MOD-base
  const defaultCurrencies: Record<string, EditorCurrency> = {
    coins: { id: 'coins', nameKey: 'common.coins', icon: '◈' },
    moderncoins: { id: 'moderncoins', nameKey: 'common.moderncoins', icon: '✦', requiredChapter: 2 },
    ancientcoins: { id: 'ancientcoins', nameKey: 'common.ancientcoins', icon: '◆', requiredChapter: 3 },
  }

  const newCurrencies: EditorCurrency[] = []

  for (const currencyId of Array.from(referencedIds)) {
    if (!existingIds.has(currencyId)) {
      // Use default if available, otherwise create minimal placeholder
      const defaultCur = defaultCurrencies[currencyId]
      if (defaultCur) {
        newCurrencies.push(defaultCur)
      } else {
        // Fallback for unknown currencies
        newCurrencies.push({
          id: currencyId,
          nameKey: `common.${currencyId}`,
          icon: '◈',
        })
      }
    }
  }

  // Ensure locale entries exist for default currencies
  ensureCurrencyLocales(newCurrencies, locales)

  return [...existingCurrencies, ...newCurrencies]
}

/**
 * Auto-create missing opponents referenced by campaign nodes
 */
export function autoCreateMissingOpponents(
  campaign: Array<{ nodes: Array<{ opponentId?: number; opponentSequence?: number[] }> }>,
  existingOpponents: EditorOpponent[],
  locales: Record<string, LocaleData>
): EditorOpponent[] {
  const existingIds = new Set(existingOpponents.map(o => o.id))
  const referencedIds = new Set<number>()

  // Collect all referenced opponent IDs from campaign
  for (const chapter of campaign) {
    for (const node of chapter.nodes) {
      if (node.opponentId != null) {
        referencedIds.add(node.opponentId)
      }
      if (node.opponentSequence) {
        for (const id of node.opponentSequence) {
          referencedIds.add(id)
        }
      }
    }
  }

  const newOpponents: EditorOpponent[] = []

  for (const oppId of Array.from(referencedIds)) {
    if (!existingIds.has(oppId)) {
      newOpponents.push({
        id: oppId,
        race: 1, // Default race
        coinsWin: 100,
        coinsLoss: 0,
        deckIds: [],
        behavior: 'default',
      })
    }
  }

  // Sort by ID to maintain order
  newOpponents.sort((a, b) => a.id - b.id)

  return [...existingOpponents, ...newOpponents]
}

/**
 * Ensure locale entries exist for auto-created currencies
 */
function ensureCurrencyLocales(
  currencies: EditorCurrency[],
  locales: Record<string, LocaleData>
) {
  // MOD-base default currency names
  const defaultNames: Record<string, string> = {
    coins: 'Jade Coins',
    moderncoins: 'Modern Coins',
    ancientcoins: 'Ancient Coins',
  }

  for (const lang of Object.keys(locales)) {
    const langData = locales[lang]
    if (!langData) continue

    for (const currency of currencies) {
      // Ensure common locale entry exists
      if (currency.nameKey && currency.nameKey.startsWith('common.')) {
        const key = currency.nameKey.replace('common.', '')
        if (!langData.common[key]) {
          langData.common[key] = defaultNames[key] || currency.id
        }
      }
    }
  }
}

/**
 * Sync locale entries for opponents, shop packs, and currencies
 * Populates missing locale data from MOD-base defaults
 */
export function syncLocaleEntries(
  opponents: EditorOpponent[],
  shopPacks: Array<{ id: string; nameKey?: string }>,
  currencies: EditorCurrency[],
  locales: Record<string, LocaleData>
) {
  // MOD-base opponent names (partial list - key opponents)
  const opponentNames: Record<number, { name: string; title: string; flavor: string }> = {
    1: { name: 'Pang Tong', title: 'The Mentor', flavor: 'A wise advisor at the imperial court.' },
    2: { name: 'Sun Shangxiang', title: 'Warrior Princess', flavor: 'The fierce princess of Wu.' },
    3: { name: 'Zhao Yun', title: 'The Brave General', flavor: 'A loyal general with unwavering honor.' },
    7: { name: 'Cao Pi', title: 'The Usurper', flavor: 'Son of Cao Cao, claimant to the Wei throne.' },
    8: { name: 'Zhang Jue', title: 'Yellow Turban Leader', flavor: 'Leader of the Yellow Turban Rebellion.' },
    17: { name: 'Tournament Champion', title: 'Qualifier Winner', flavor: 'Victorious through the tournament brackets.' },
    31: { name: 'Mi Hun', title: 'Wu Xing Commander', flavor: 'Commander of the Wu Xing forces.' },
    32: { name: 'Cao Pi', title: 'Emperor of Wei', flavor: 'The traitorous emperor reveals his true colors.' },
    37: { name: 'Final Guardian', title: 'Last Defense', flavor: 'The final obstacle before the end.' },
    38: { name: 'Warlord', title: 'Supreme Commander', flavor: 'A master of military strategy.' },
    39: { name: 'Ultimate Opponent', title: 'The Final Challenge', flavor: 'The ultimate test of skill.' },
  }

  // MOD-base shop pack names
  const shopNames: Record<string, { name: string; desc: string }> = {
    tier_1_recruit: { name: 'Recruit Pack', desc: 'Basic cards for new duelists.' },
    tier_2_soldier: { name: 'Soldier Pack', desc: 'Improved cards for growing armies.' },
    tier_3_officer: { name: 'Officer Pack', desc: 'Advanced cards for seasoned officers.' },
    tier_4_commander: { name: 'Commander Pack', desc: 'Elite cards for battlefield commanders.' },
    tier_5_temple: { name: 'Temple Pack', desc: 'Sacred cards from ancient temples.' },
    tier_6_warlord: { name: 'Warlord Pack', desc: 'Legendary cards of the greatest warlords.' },
  }

  for (const lang of Object.keys(locales)) {
    const langData = locales[lang]
    if (!langData) continue

    // Sync opponent locales
    for (const opp of opponents) {
      const oppKey = String(opp.id)
      if (!langData.opponents[oppKey]) {
        const defaults = opponentNames[opp.id]
        langData.opponents[oppKey] = {
          name: defaults?.name || `Opponent ${opp.id}`,
          title: defaults?.title || 'Unknown',
          flavor: defaults?.flavor || 'A mysterious challenger.',
        }
      }
    }

    // Sync shop pack locales
    for (const pack of shopPacks) {
      if (!langData.shop[pack.id]) {
        const defaults = shopNames[pack.id]
        langData.shop[pack.id] = {
          name: defaults?.name || pack.nameKey || pack.id,
          desc: defaults?.desc || 'A pack of cards.',
        }
      }
    }

    // Ensure currency common entries exist
    ensureCurrencyLocales(currencies, { [lang]: langData })
  }
}
