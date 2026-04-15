# Echoes of Sanguo — Game Design Review

**Date:** 2026-04-15  
**Scope:** Editor + TCG Format + Engine repositories  
**Inspiration:** Yu-Gi-Oh! Forbidden Memories (Game Boy Color)

---

## Ecosystem Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   EDITOR        │────▶│  TCG Format      │────▶│   ENGINE        │
│   (noble-badger)│     │  (@wynillo/tcg)  │     │   (Game Runtime)│
│                 │     │                  │     │                 │
│ Create .tcg     │     │ Validate/Pack    │     │ Load & Execute  │
│ packages        │     │ archives         │     │ gameplay        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         ▲                                              │
         └──────────────────────────────────────►  MOD base
                  (Load at runtime)                (Reference content)
```

| Repository | Role | Key Files |
|------------|------|-----------|
| **Editor** | Visual TCG creator | `src/editors/*`, `src/stores/projectStore.ts` |
| **TCG Format** | Archive library | `src/tcg-loader.ts`, `src/types.ts` |
| **Engine** | Game runtime | `src/engine.ts`, `src/effect-registry.ts` |

---

## Core Game Rules (Forbidden Memories Style)

| Rule | Value | Notes |
|------|-------|-------|
| Starting LP | 8000 | Configurable in `rules.json` |
| Hand Limit | 8 cards (end phase) | Draw limit is 10 |
| Field Zones | 5 monster zones | Plus spell/trap zone |
| Deck Size | 40 cards max | 3-copy limit per card |
| Draw Phase | 1 card per turn | Configurable |
| Tribute System | **NONE** | All monsters immediately playable |
| Summon Sickness | **YES** | Newly summoned monsters can't attack |
| Fusion Exception | **No summoning sickness** | Can attack immediately |

**Design Philosophy:** Intentionally simpler than modern Yu-Gi-Oh! — resembles Famicom-era TCGs.

---

## Card Types

```typescript
// From tcg-format-repo/src/types.ts
TCG_TYPE_MONSTER   = 1   // Normal monsters: level, atk, def, attribute, race
TCG_TYPE_FUSION    = 2   // Fusion monsters: special summon from hand
TCG_TYPE_SPELL     = 3   // spellType: 1=Normal, 2=Targeted, 3=FromGrave, 4=Field
TCG_TYPE_TRAP      = 4   // trapTrigger: 1-9 (see below)
TCG_TYPE_EQUIPMENT = 5   // atkBonus, defBonus, equipReqRace, equipReqAttr
```

### Trap Triggers (9 Types)

| ID | Trigger | Timing |
|----|---------|--------|
| 1 | `onAttack` | Opponent declares attack |
| 2 | `onOwnMonsterAttacked` | Your monster targeted |
| 3 | `onOpponentSummon` | After opponent summons |
| 4 | `manual` | Any time (player discretion) |
| 5 | `onOpponentSpell` | When opponent activates spell |
| 6 | `onAnySummon` | Any summon, either player |
| 7 | `onOpponentTrap` | When opponent activates trap |
| 8 | `onOppCardEffect` | When opponent's card effect activates |
| 9 | `onOpponentDraw` | When opponent draws |

---

## Effect System

**Scale:** 60+ actions, 7 trigger types  
**Location:** `engine-repo/src/effect-registry.ts` (982 lines)

### Effect Triggers

| Trigger | Fires When |
|---------|------------|
| `onSummon` | Monster summoned to field |
| `onDestroyByBattle` | Monster destroyed in battle |
| `onDestroyByOpponent` | Monster destroyed by opponent (any means) |
| `onFlipSummon` | Monster flip summoned |
| `onDealBattleDamage` | Monster deals battle damage to opponent |
| `onSentToGrave` | Card sent to graveyard |
| `passive` | Continuous effect while on field |

### Effect Actions (By Category)

| Category | Actions |
|----------|---------|
| **Damage/Heal** | `dealDamage`, `gainLP`, `reflectBattleDamage` |
| **Card Advantage** | `draw`, `searchDeckToHand`, `peekTopCard`, `drawThenDiscard` |
| **Stat Mods** | `buffField`, `debuffField`, `tempBuffField`, `tempDebuffField`, `tempAtkBonus`, `permAtkBonus`, `halveAtk`, `doubleAtk`, `swapAtkDef` |
| **Removal** | `bounceStrongestOpp`, `destroyAll`, `destroyStrongestOpp`, `destroyWeakestOpp`, `destroyByFilter` |
| **Graveyard** | `reviveFromGrave`, `reviveFromEitherGrave`, `salvageFromGrave`, `shuffleGraveIntoDeck` |
| **Summoning** | `specialSummonFromHand`, `specialSummonFromDeck`, `createTokens`, `excavateAndSummon` |
| **Control** | `stealMonster`, `stealMonsterTemp`, `cancelAttack`, `preventAttacks`, `skipOppDraw` |
| **Passive** | `passive_piercing`, `passive_indestructible`, `passive_directAttack`, `passive_effectImmune`, `passive_negateTraps` |

### Effect Syntax

```
// Examples from effect-serializer.ts
"buffField(500,{r=1,a=2})"     → Buff all Dragon/Fire monsters +500 ATK/DEF
"dealDamage(opponent,attacker.effectiveATK*1f)" → Deal attacker's ATK as damage
"destroyOppField()"             → Destroy opponent's monster
"passive_piercing()"            → Piercing damage in defense position
```

### Filter Syntax

```
{r=1,a=2,maxAtk=1000,minLevel=5,rnd=2}
r = race ID, a = attribute ID, ct = card type
maxAtk/minAtk = ATK range, maxLevel/minLevel = level range
rnd = random count
```

---

## Battle System

**Battle Flow:**
```
Main Phase 1
  ├→ Summon monsters (unlimited)
  ├→ Activate spells/traps
  └→ Set monsters/spells/traps (face-down)

Battle Phase
  ├→ Select attacking monster
  ├→ Select target (monster or direct)
  ├→ Damage Step (flip, calculate, check traps)
  └→ Apply battle damage

Main Phase 2
  ├→ Activate spells/traps
  └→ Set cards

End Phase
  └→ Enforce hand limit (discard to 8)
```

**Damage Calculation:**
```typescript
// Attack vs Attack
if (attacker.ATK > defender.ATK) {
  defender.destroyed = true;
  opponent.LP -= (attacker.ATK - defender.ATK);
} else if (attacker.ATK < defender.ATK) {
  attacker.destroyed = true;
  attackerOwner.LP -= (defender.ATK - attacker.ATK);
} else {
  both.destroyed = true;  // No LP damage
}

// Attack vs Defense
if (attacker.ATK > defender.DEF) {
  defender.destroyed = true;  // No LP damage
} else if (attacker.ATK < defender.DEF) {
  attackerOwner.LP -= (defender.DEF - attacker.ATK);  // Attacker takes damage
}

// Direct Attack (no monsters)
opponent.LP -= attacker.ATK;
```

---

## Fusion System

**Formula Structure:**
```typescript
interface TcgFusionFormula {
  id:         string;
  comboType:  string;      // "race_combo", "specific_cards"
  operand1:   number;      // Race ID 1
  operand2:   number;      // Race ID 2
  priority:   number;      // For conflicting recipes
  resultPool: number[];    // Possible result card IDs
}
```

**Fusion Process:**
1. Player selects 2 monsters from hand
2. Match against fusion recipes
3. If match found, select from resultPool (if multiple)
4. Fusion monster summoned directly from hand
5. **No summoning sickness** — can attack immediately

**Balance:** Fusion monsters are premium cards (higher level, stats, effects). Materials -1 from hand, but immediate board impact.

---

## AI System

**Location:** `engine-repo/src/ai-behaviors.ts`

| Profile | Aggression | Risk Tolerance | Strategy |
|---------|------------|----------------|----------|
| `default` | 0.5 | 0.5 | Balanced play |
| `aggressive` | 0.9 | 0.8 | Prioritizes attacks, risky plays |
| `defensive` | 0.3 | 0.2 | Safe attacks, sets monsters first |
| `smart` | Dynamic | Dynamic | Deep board evaluation, calculates lethal |
| `cheating` | N/A | N/A | Knows hidden info, never mistakes |

**AI Cycle:**
```
1. Draw Phase
2. Main Phase 1 → Fusion, summon, activate spells, set traps
3. Battle Phase → Calculate best targets, check lethal, execute attacks
4. Main Phase 2 → Set remaining cards
5. End Phase → Enforce hand limit
```

---

## Campaign System

**10 Node Types:**
- `duel`, `duel_elite`, `boss` — Combat encounters
- `story`, `branch` — Narrative beats
- `shop`, `reward`, `treasure` — Economy/loot
- `rest` — LP recovery
- `gauntlet` — Sequential duel chain

**Node Structure:**
```typescript
interface CampaignNode {
  id: string;
  type: CampaignNodeType;
  opponentId?: number;
  opponentSequence?: number[];  // For gauntlet
  storyId?: string;              // Dialogue script
  rewards?: { currency?, cards?, packs? };
  unlockCondition?: { type: string; params: object };
  position: { x: number; y: number };
}
```

---

## Shop & Economy

**Multi-Currency System:**
```typescript
interface Currency {
  id: string;         // 'coins', 'moderncoins', 'ancientcoins'
  nameKey: string;    // Localization key
  icon: string;
  requiredChapter?: number;
}
```

**Shop Pack Structure:**
```typescript
interface ShopPack {
  id: string;         // 'tier_1_recruit'
  cost: number;
  costCurrencyId?: string;  // Multi-currency
  drawCount: number;
  cardPool: number[];
  dropRates?: { 1: 0.6, 2: 0.25, 4: 0.10, 6: 0.04, 8: 0.01 };
  unlockCondition?: string;
}
```

**Progression Loop:**
```
Win Duels → Earn Coins → Buy Packs → Expand Collection
    ↓                              ↓
Unlock Chapters            Build Better Decks
    ↓                              ↓
Face Harder Opponents → Win More Duels
```

---

## Localization

**Structure (from `TCG_FORMAT` docs):**
```typescript
interface LocaleData {
  common: Record<string, string>;           // UI, currency names
  cards: Record<string, { name, description }>;
  opponents: Record<string, { name, title, flavor }>;
  shop: Record<string, { name, desc }>;
  campaign: Record<string, string>;         // Story dialogue
  races: Record<string, string>;
  attributes: Record<string, string>;
}
```

**Current Languages:** EN, DE

---

## Design Strengths

1. **Accessibility** — No tribute system, simple summoning, forgiving for new players
2. **Modularity** — Clean separation: TCG Format (data) vs Engine (logic) vs Editor (tooling)
3. **Effect Diversity** — 60+ actions enable complex, varied strategies
4. **Campaign Integration** — Node-based campaign with branching paths, unlock conditions
5. **Economy Depth** — Multi-currency, tiered shop, progression gating
6. **AI Variety** — 5 behavior profiles create distinct opponent experiences
7. **Extensibility** — Effect system can grow without engine changes

---

## Design Gaps

| Gap | Impact | Possible Fix |
|-----|--------|--------------|
| **No Stack/Chain System** | Can't respond to traps with other traps | Add effect stack with priority system |
| **No Spell Speeds** | All effects resolve immediately | Add spell speed 1/2/3 hierarchy |
| **Fusion Balance** | Fusion from hand (no sickness) is very strong | Add fusion limit per turn? |
| **No Extra Deck** | Fusion cards compete for deck slots | Intentional design or oversight? |
| **Trap Timing Ambiguity** | `onOppCardEffect` unclear | Add timing windows chart |
| **No Battle Step** | Can't activate effects during damage step | Add before/after damage step windows |
| **Equipment Loss** | Equipment destroyed if monster leaves | Add re-equip option? |
| **Passive Conflicts** | No timestamp system for conflicts | Implement timestamp ordering |

---

## Editor Improvement Recommendations

### High Priority

1. **Effect Builder UI**
   - Dropdown for 60+ effect actions
   - Parameter input forms (race/attribute/ATK sliders)
   - Real-time syntax validation
   - Preview effect in plain English

2. **Trap Trigger Picker**
   - Visual selector with trigger descriptions
   - Example scenarios for each trigger type

3. **Battle Simulator**
   - Test card interactions
   - Verify effect triggers fire correctly
   - Simulate combat scenarios

### Medium Priority

4. **Fusion Recipe Visualizer**
   - Grid of race combinations
   - Show possible results per combo
   - Warn about conflicting priorities

5. **Campaign Map Editor**
   - Drag-and-drop node positioning
   - Visual connections between nodes
   - Preview unlock conditions live

6. **Localization Completeness Checker**
   - Show missing translations per language
   - Bulk import/export locale files
   - Find untranslated entries

---

## Technical Observations

**Effect Registry:**
- 982 lines of effect implementations
- Each action: `(desc, ctx) => EffectSignal`
- Context provides 30+ helper functions (`damage`, `summon`, `selectFromDeck`, `vfx`, `log`)

**State Management:**
- React Context for UI state
- Engine.ts has monolithic game state
- **Risk:** Engine state and UI state can diverge

**Performance:**
- GSAP for animations (hardware accelerated)
- React 19 concurrent features (not fully utilized)
- No WebWorkers for AI calculation
- **Potential bottleneck:** AI thinking on low-end devices

---

## Related Files

| File | Purpose |
|------|---------|
| `editor/src/types/project.ts` | TypeScript interfaces for editor |
| `editor/src/editors/CardEditor.tsx` | Card creation/editing UI |
| `tcg-format/src/types.ts` | TCG archive type definitions |
| `engine/src/effect-registry.ts` | 60+ effect implementations |
| `engine/src/effect-serializer.ts` | Effect string codec |
| `engine/src/engine.ts` | Core game engine (1543 lines) |
| `engine/src/ai-behaviors.ts` | 5 AI behavior profiles |
| `engine/src/crafting.ts` | Effect item crafting (draft) |

---

## Conclusion

Echoes of Sanguo is a well-architected Forbidden Memories-style TCG with:
- Clean data/logic separation
- Flexible effect system (60+ actions)
- Campaign-driven PvE with meaningful progression
- Multi-currency economy with tiered shop

**Best for:** Fan game/modding platform, casual TCG players  
**Not for:** Competitive play (needs stack system, spell speeds)  
**Biggest Opportunity:** Enhanced editor tooling for effect crafting

---

*Generated from analysis of Editor, TCG Format, and Engine repositories.*
