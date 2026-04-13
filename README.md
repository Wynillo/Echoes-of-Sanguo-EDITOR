# Echoes of Sanguo — Card Editor

A desktop editor for creating and managing **Echoes of Sanguo** TCG (Trading Card Game) packages. Build your own custom card sets, campaigns, opponents, and game rules — then export them as `.tcg` archives for use in the [Echoes of Sanguo Engine](https://github.com/Wynillo/Echoes-of-Sanguo-ENGINE).

Part of the **Echoes of Sanguo Ecosystem**:

| Repository | Role |
|------------|------|
| **[This Editor](https://github.com/Wynillo/noble-badger)** | Visual editor for creating `.tcg` packages |
| [Engine](https://github.com/Wynillo/Echoes-of-Sanguo-ENGINE) | Game runtime, UI, effect system, AI |
| [TCG Format](https://github.com/Wynillo/Echoes-of-Sanguo-TCG) | Archive format library (load/validate/pack) |
| [MOD Base](https://github.com/Wynillo/Echoes-of-sanguo-MOD-base) | Reference card set & content templates |

---

## What It Does

The editor provides a visual interface for all aspects of TCG creation:

- **Card Editor** — Create monsters, spells, traps, equipment, and fusion monsters with full effect definitions
- **Localization** — Multi-language support (card names, descriptions, UI strings)
- **Campaign Builder** — Design node-based campaign maps with duels, story events, shops, and branching paths
- **Opponent Designer** — Configure AI behaviors, decks, and unlock conditions
- **Shop System** — Define booster packs with card pools, pricing, and drop rates
- **Fusion Recipes** — Set up monster fusion formulas
- **Game Rules** — Customize life points, field zones, deck size, draw rules
- **Attributes & Races** — Define card metadata and visual themes
- **Currency & Starter Decks** — Set up progression systems
- **Mod Info** — Package metadata for distribution

Export your work as a standard `.tcg` archive that loads directly into the game engine.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

The editor runs in your browser at `http://localhost:5173`.

---

## Project Structure

```
src/
├── editors/          – Section editors (Card, Campaign, Opponent, Shop, etc.)
├── components/       – Reusable UI (CardPreview, EffectPicker, ImagePicker, etc.)
├── screens/          – Navigation screens (Start, Dashboard, SectionList, Detail)
├── stores/           – Zustand state management (projectStore)
├── types/            – TypeScript interfaces (ProjectData, EditorCard, etc.)
├── validation/       – Schema validators (validateProject)
├── fs/               – File system operations (read/write TCG archives)
├── utils/            – Helpers (localeHelpers, imageConvert, migrations)
├── data/             – Static data (effect definitions, icons)
└── i18n.ts           – Internationalization setup
```

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| React 19.2.4 | UI framework |
| TypeScript 5.9 | Type safety |
| Vite 8 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| Zustand 5.0 | State management |
| React Router 7 | Navigation |
| i18next 26 | Internationalization |
| JSZip 3.10 | TCG archive packing |
| @wynillo/tcg-format | Format validation & export |
| React Icons 5 | Icon library |
| Vitest 4 | Unit testing |
| Testing Library | Component tests |

---

## Key Features

### Validation
Built-in validators check your project data before export, catching structural errors and warnings early.

### Autosave
Your work is automatically saved to prevent data loss.

### Migrations
Legacy project formats are automatically migrated to the current structure.

### Image Support
Import and manage card artwork with automatic conversion and packing.

### Localization
Full i18n support for creating multi-language card sets.

---

## Development

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Lint
npm run lint
```

---

## Related Projects

This editor is part of the **Echoes of Sanguo** ecosystem — a browser-based TCG inspired by Yu-Gi-Oh! Forbidden Memories:

- **Engine**: The game runtime that loads `.tcg` packages and provides the gameplay experience
- **TCG Format**: The underlying archive format library
- **MOD Base**: A reference implementation showing a complete card set

Together, they form a complete modding pipeline: **Create** (Editor) → **Package** (TCG Format) → **Play** (Engine).

---

## License

MIT
