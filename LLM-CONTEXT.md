# Bitburner Save Editor V2 - LLM Context

## IMPORTANT: Instructions for LLM Agents

**This document serves as persistent memory across chat sessions. Follow these guidelines:**

1. **Commit messages**: When the user asks for a "commit message":
   - **ALWAYS run `git diff --staged` FIRST** to check what is staged
   - **If nothing is staged** (empty output), tell the user: "There are no staged changes. Please stage your changes first (e.g., `git add <files>`) and then ask for a commit message."
   - **Do NOT provide a commit message if nothing is staged** - this is critical!
   - **Do NOT run `git diff` (unstaged)** as a fallback - only staged changes matter for commits
   - If changes ARE staged, provide a simple, short, single-line commit message
   - Do NOT create the commit yourself unless explicitly asked

2. **Maintain this document**: When you discover important architectural decisions, patterns, gotchas, or implementation details during your work, add them to the appropriate section of this document. This ensures future AI agents have the context they need.

3. **Update the README checklist**: The `README.md` file contains a TODO checklist that tracks project progress. You MUST:
   - Mark items as complete `[x]` when you finish implementing them
   - Add new checklist items when you identify additional work needed
   - Keep sub-items organized under their parent features
   - Maintain the existing format and structure

4. **Document patterns**: If you establish a new pattern or convention while working on a feature, document it here so future implementations remain consistent.

5. **Note breaking changes**: If you discover version-specific behavior or compatibility issues, document them in the "Important Notes" section.

6. **This file is for LLMs**: Write for other AI agents, not humans. Be concise but comprehensive. Focus on what an LLM needs to work effectively on this codebase.

---

## Project Overview

This is a **web-based save file editor** for the game **Bitburner** (Steam version 2.8.1+). It allows users to upload their Bitburner save files and modify various game attributes through a terminal-styled interface.

**Key Design Principles**:
- **Game-centric organization**: UI organized by gameplay concepts (Servers, Factions, Companies), NOT by save file structure
- **Terminal aesthetic**: Matches Bitburner's 1980s hacker/cyberpunk terminal theme
- **Type safety**: Runtime validation with Zod + TypeScript compile-time checking
- **No data loss**: Maintains immutable original save, allows full revert at any time

**Tech Stack**: Vite, React 18, TypeScript, Tailwind CSS, Zod (validation), Pako (gzip)

**This is a complete rewrite**: Unlike the original project (MobX, CRA, save-file-centric UI), this version is built from scratch with modern tooling and user-centric design.

---

## Save File Format

Bitburner save files can be in three formats:

1. **Gzipped JSON** (`.json.gz`) - Compressed JSON (most common)
2. **Base64-encoded JSON** (`.json`) - JSON encoded as base64 string (older versions)
3. **Plain JSON** (`.json`) - Direct JSON (version 2.8.1+)

### Save File Structure

```typescript
{
  ctor: "BitburnerSaveObject",
  data: {
    PlayerSave: "{...}",        // Stringified JSON
    AllServersSave: "{...}",    // Stringified JSON
    FactionsSave: "{...}",      // Stringified JSON
    // ... etc - each value is a stringified JSON object
  }
}
```

**Critical quirk**: Each property in `data` is a **stringified JSON value** that must be parsed individually. This is Bitburner's save format, not our choice.

### Loading Process

1. Detect format (gzipped, base64, or JSON)
2. Decompress/decode if needed
3. Parse outer JSON to get `BitburnerSaveObject`
4. Validate `ctor === "BitburnerSaveObject"`
5. Parse each nested string value into actual objects
6. Validate with Zod schemas
7. Deep-clone into `original` and `modified` copies

### Exporting Process

1. Stringify each game system's data independently
2. Apply special handling (e.g., filter zero-value companies)
3. Wrap in `BitburnerSaveObject` structure
4. Encode/compress to match original format
5. Generate download with filename pattern: `bitburnerSave_{timestamp}_{bitnode}-H4CKeD.json[.gz]`

---

## Project Structure

```
src/
  components/
    ui/              # Reusable terminal-styled components
      Button.tsx
      Input.tsx
      Table.tsx
      Card.tsx
      ...
    layout/          # Layout components
      AppLayout.tsx
    sections/        # Game-centric editor sections
      PlayerSection.tsx
      ServersSection.tsx
      CompaniesSection.tsx
      FactionsSection.tsx
      GangsSection.tsx
      ...
  models/
    schemas/         # Zod schemas for runtime validation
      player.ts
      servers.ts
      companies.ts
      ...
    types.ts         # TypeScript types (inferred from Zod)
    constants.ts     # Game data (companies, jobs, augs, etc.)
  lib/
    save-loader.ts   # Load/parse save files
    save-exporter.ts # Export/compress save files
    utils.ts         # Utility functions
  store/
    save-store.ts    # Global state management
  pages/
    ComponentDemo.tsx # UI component showcase
    EditorShell.tsx   # Editor landing/placeholder
  App.tsx                # Top-level shell (routes editor vs demo)
  main.tsx
  index.css
```

### App Shell / Demo Toggle
- `App.tsx` now only switches between `EditorShell` (normal app) and `ComponentDemo` (UI showcase) based on query params (`?demo` or `?ui-demo`) or user actions.
- Shared header/footer/background live in `components/layout/AppLayout.tsx` so both pages stay consistent.
- `ComponentDemo` accepts an `onExit` callback; default fallback is navigating back to the current path.
- `EditorShell` currently holds the upload card placeholder; save loading logic should hook into it later.
- Section navigation scaffold lives in `components/sections/GameSectionTabs.tsx` using `ControlledTabs` to enumerate all primary game-centric sections. Each tab renders a `SectionStub` (in the same folder) until the real editor UI is wired in.

---
## UI Architecture: Game-Centric Sections

The UI is organized by **gameplay concepts**, not save file structure:

### Servers Section (implemented)
- Component lives at `src/components/sections/ServersSection.tsx` and contains the `ServerCard` inline; uses `Card`, `Input`, `Checkbox`, `NumberInput`, and `ResetAction` from `components/ui`.
- Filters: text search across hostname/org/IP, purchased-only (uses `PlayerSave.data.purchasedServers`), modified-only (JSON.stringify compare against `originalSave.AllServersSave[hostname]`), and hackable-only (moneyMax defined). Sorted with purchased servers first, then hostname.
- Cards show RAM/cores, money and security stats when present, port counts, root/backdoor/connected badges, and file counts (scripts/programs/messages read-only). Expand toggle reveals editors for RAM, money, security fields, admin/backdoor flags, and individual port booleans; ports required is editable.
- Reset wiring: header reset button appears only when a server differs from original; section-level reset uses `ResetAction` bound to `resetAllServers` and `hasServerChanges`.
- Store interaction: edits call `updateServerStats` (shallow merge of `server.data`), per-card reset calls `resetServer` (restores server entry and re-syncs purchasedServers ordering to original), change detection uses `hasServerChanges`.

### Primary Sections

1. **Player** - Character identity & attributes
   - Stats & Skills (hacking, combat stats, exp)
   - Money & Resources (money, karma, entropy)
   - Multipliers (read-only, derived from augmentations)

2. **Augmentations** - Character enhancements
   - Installed augmentations
   - Queued augmentations
   - NeuroFlux Governor special handling (multiple levels)

3. **Factions** - Organization membership & reputation
   - Membership status
   - Invitations
   - Reputation & favor
   - Banned status

4. **Companies & Careers** - Employment & reputation
   - Company reputation & favor
   - Current jobs
   - Job history

5. **Servers** - Network infrastructure
   - All servers (network view)
   - Purchased servers (player-owned)
   - Current terminal server
   - Server properties (RAM, money, access, backdoors)
   - Server content (scripts, contracts, programs, files)

6. **Gangs** - Gang management (if unlocked)
   - Player gang stats
   - Gang members (add/edit/remove)
   - Territory & power
   - Rival gangs

7. **Hacknet** - Passive income nodes
   - Hacknet nodes (add/edit/remove)
   - Hash manager & upgrades

8. **Progression** - Meta-game tracking
   - BitNode & source files
   - Playtime tracking
   - Exploits & achievements

9. **Business** - Advanced features (if unlocked)
   - Corporation
   - Bladeburner
   - Sleeves

10. **Stock Market**
    - Market access flags
    - Active orders
    - Money tracking

11. **Special** - Unique systems
    - Stanek's Gift
    - Go (minigame)
    - Infiltrations

12. **Settings**
    - Game settings
    - UI preferences
    - Theme

### Section Component Pattern

All section components should follow this pattern:

```typescript
import { useSaveStore } from '../store/save-store';

export function ServerSection() {
  const { servers, updateServer, resetServer } = useSaveStore();
  const [search, setSearch] = useState('');

  // Filter data based on search
  const filtered = servers.filter(s =>
    s.hostname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="panel-terminal">
      <h2 className="text-xl mb-4 text-terminal-secondary">
        &gt; SERVERS
      </h2>

      {/* Search */}
      <Input
        value={search}
        onChange={setSearch}
        placeholder="Search servers..."
        className="mb-4"
      />

      {/* Data grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(server => (
          <ServerCard
            key={server.hostname}
            server={server}
            onUpdate={updateServer}
            onReset={resetServer}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## State Management

### Zustand Store Pattern (Recommended)

Use Zustand for simple, TypeScript-friendly state management:

```typescript
import create from 'zustand';

interface SaveStore {
  // State
  originalSave: ParsedSaveData | null;
  modifiedSave: ParsedSaveData | null;

  // Computed
  hasChanges: () => boolean;

  // Actions
  loadSave: (file: File) => Promise<void>;
  updatePlayer: (updates: Partial<PlayerData>) => void;
  updateServer: (hostname: string, updates: Partial<ServerData>) => void;
  revertChanges: () => void;
  exportSave: () => void;
}

export const useSaveStore = create<SaveStore>((set, get) => ({
  originalSave: null,
  modifiedSave: null,

  hasChanges: () => {
    const { originalSave, modifiedSave } = get();
    return JSON.stringify(originalSave) !== JSON.stringify(modifiedSave);
  },

  loadSave: async (file) => {
    const raw = await loadSaveFile(file);
    const parsed = await parseSaveData(raw);
    set({
      originalSave: structuredClone(parsed),
      modifiedSave: structuredClone(parsed),
    });
  },

  updatePlayer: (updates) => {
    set((state) => ({
      modifiedSave: {
        ...state.modifiedSave,
        PlayerSave: {
          ...state.modifiedSave.PlayerSave,
          ...updates,
        },
      },
    }));
  },

  // ... more update methods
}));
```

### Current Save Store (implemented)

- Located at `src/store/save-store.ts` using Zustand.
- Keeps `originalSave` as a deep-frozen clone of the parsed save to prevent accidental mutation; `currentSave` is a separate editable clone.
- `loadFromFile` parses via `loadAndParseSaveFile`, records `saveFormat`/`lastFileName`, and sets status flags (`idle` | `loading` | `ready` | `error`).
- `resetToOriginal` replaces `currentSave` with a fresh clone of `originalSave`; `mutateCurrentSave` clones before applying a mutator; `replaceCurrentSave` swaps the editable copy wholesale.
- `hasChanges` compares `originalSave` and `currentSave` via `JSON.stringify`; preserve ordering/structure to avoid false positives.

### React Context Alternative

If you prefer Context API:

```typescript
interface SaveContextValue {
  originalSave: ParsedSaveData | null;
  modifiedSave: ParsedSaveData | null;
  updatePlayer: (updates: Partial<PlayerData>) => void;
  // ... etc
}

export const SaveContext = createContext<SaveContextValue>(null!);

export function SaveProvider({ children }) {
  const [originalSave, setOriginalSave] = useState<ParsedSaveData | null>(null);
  const [modifiedSave, setModifiedSave] = useState<ParsedSaveData | null>(null);

  // ... implementation

  return (
    <SaveContext.Provider value={{ originalSave, modifiedSave, updatePlayer }}>
      {children}
    </SaveContext.Provider>
  );
}
```

---

## Zod Schema Pattern

Define schemas in `models/schemas/` and infer TypeScript types:

```typescript
// models/schemas/player.ts
import { z } from 'zod';

export const PlayerSaveSchema = z.object({
  ctor: z.literal('PlayerObject'),
  data: z.object({
    money: z.number().default(0),
    karma: z.number().default(0),
    hacking: z.number().min(1).default(1),
    strength: z.number().min(1).default(1),
    // ... all player fields
    purchasedServers: z.array(z.string()).default([]),
    augmentations: z.array(z.object({
      name: z.string(),
      level: z.number().default(1),
    })).default([]),
  }),
});

// Export TypeScript type
export type PlayerSave = z.infer<typeof PlayerSaveSchema>;
```

### Validation Best Practices

1. **Use `.default()` for optional fields** - Ensures old saves still work
2. **Use `.transform()` for normalization** - Fix common issues automatically
3. **Use `.safeParse()` for user input** - Never throw on invalid data
4. **Provide helpful error messages** - User-facing errors, not stack traces

```typescript
const result = PlayerSaveSchema.safeParse(data);
if (!result.success) {
  const errors = result.error.flatten();
  throw new Error(`Invalid player data: ${errors.fieldErrors}`);
}
```

---

## Terminal Theme System

### CRITICAL: Always Check for Existing Components First!

**BEFORE implementing any UI element (buttons, inputs, checkboxes, selects, modals, etc.):**

1. **Check `src/components/ui/index.ts`** - All available UI components are exported here
2. **Search for the component** - Use Glob to find existing components (e.g., `**/Checkbox.tsx`)
3. **Read the component** - Understand its API and styling before using it
4. **Use existing components** - NEVER create raw HTML elements when a styled component exists

Common components available in `src/components/ui/`:
- `Button` - Terminal-styled buttons with variants
- `Input` - Text inputs with terminal styling
- `NumberInput` - Number inputs with increment/decrement buttons
- `Checkbox` - ASCII-style checkboxes with "×" mark
- `Select` - Dropdown with search functionality
- `Card` - Panel containers with optional title/subtitle/actions
- `Modal`, `ConfirmModal` - Dialog boxes
- `Tabs`, `ControlledTabs` - Tab navigation
- `Table`, `TableRow`, `TableCell` - Data tables
- `Textarea` - Multi-line text input
- `FileInput` - File upload input
- `MultiSelect` - Multiple selection dropdown
- `Label` - Form labels
- `ResetAction` - Reset button or "No Modifications" label

**Example of what NOT to do:**
```tsx
// BAD - Creating raw checkbox
<input type="checkbox" className="..." />

// GOOD - Using existing Checkbox component
<Checkbox checked={value} onChange={handler} />
```

### Color Palette

```css
--terminal-bg: #000000
--terminal-primary: #00ff00     /* Bright green */
--terminal-secondary: #adff2f    /* Yellow-green */
--terminal-dim: #008800          /* Dark green */
--terminal-glow: #00ff00         /* Glow effect */
```

### Reusable Component Styles

All UI components should use these Tailwind utility classes:

**Button**:
```tsx
className="px-4 py-2 border border-terminal-primary bg-black text-terminal-primary
           hover:bg-terminal-dim hover:text-black transition-colors
           font-mono uppercase tracking-wider"
```

**Input**:
```tsx
className="bg-black border border-terminal-primary text-terminal-primary px-3 py-2
           focus:outline-none focus:border-terminal-secondary focus:ring-1
           focus:ring-terminal-secondary font-mono placeholder-terminal-dim"
```

**Panel/Card**:
```tsx
className="bg-black border border-terminal-primary p-4
           shadow-lg shadow-terminal-primary/20"
```

### CRT Effects

The app includes scanline and flicker animations. Apply via:

```tsx
<div className="crt-scanlines">
  {/* Content with scanline overlay */}
</div>

<span className="text-glow">
  {/* Text with phosphor glow */}
</span>
```

---

## Data Cross-References (Critical!)

Some game data is duplicated across multiple save sections. Edits MUST keep these in sync:

### 1. Purchased Servers
- `PlayerSave.data.purchasedServers` (string[]) - List of hostnames
- `AllServersSave[hostname].purchasedByPlayer` (boolean) - Flag on each server

**When adding a purchased server**:
```typescript
// Add to player's list
modifiedSave.PlayerSave.data.purchasedServers.push(hostname);

// Set flag in AllServersSave
modifiedSave.AllServersSave[hostname].purchasedByPlayer = true;
```

**When resetting**:
Must restore BOTH the array AND all flags to match original save exactly.

### 2. Faction Membership
- `PlayerSave.data.factions` (string[]) - Joined factions
- `FactionsSave[name].data.isMember` (boolean) - Member flag per faction

**When adding membership**:
```typescript
modifiedSave.PlayerSave.data.factions.push(factionName);
modifiedSave.FactionsSave[factionName].data.isMember = true;
```

### 3. Faction Invitations
- `PlayerSave.data.factionInvitations` (string[]) - Pending invites
- `FactionsSave[name].data.alreadyInvited` (boolean) - Invited flag

**When adding invitation**:
```typescript
modifiedSave.PlayerSave.data.factionInvitations.push(factionName);
modifiedSave.FactionsSave[factionName].data.alreadyInvited = true;
```

### 4. Jobs & Companies
- `PlayerSave.data.jobs` (Record<company, jobTitle>) - Current jobs
- `CompaniesSave[company]` (reputation, favor) - Company data

Jobs reference companies, but not all companies have save entries (only non-zero rep/favor).

### 5. Gang Faction
- `PlayerSave.data.gang.facName` (string) - Player's gang faction
- `AllGangsSave[facName]` (power, territory) - Gang stats

Player's gang name should exist in AllGangsSave.

---

## Change Detection & Reset System

### hasChanges Detection

Uses deep equality via JSON.stringify:

```typescript
hasChanges: () => {
  return JSON.stringify(originalSave) !== JSON.stringify(modifiedSave);
}
```

**Critical**: Resets must restore EXACT original structure including:
- Object key ordering
- Array element ordering
- Nested object references
- Cross-reference consistency

### Reset Helper Pattern

**BAD** (doesn't preserve structure):
```typescript
resetServer(hostname) {
  modifiedSave.AllServersSave[hostname].maxRam = originalSave.AllServersSave[hostname].maxRam;
  // Other fields might differ, order might differ, still shows hasChanges!
}
```

**GOOD** (deep clone):
```typescript
resetServer(hostname) {
  modifiedSave.AllServersSave[hostname] = structuredClone(
    originalSave.AllServersSave[hostname]
  );

  // Also restore cross-references if applicable
  const wasPurchased = originalSave.PlayerSave.data.purchasedServers.includes(hostname);
  const isPurchased = modifiedSave.PlayerSave.data.purchasedServers.includes(hostname);

  if (wasPurchased && !isPurchased) {
    // Re-add at original index
    const originalIndex = originalSave.PlayerSave.data.purchasedServers.indexOf(hostname);
    modifiedSave.PlayerSave.data.purchasedServers.splice(originalIndex, 0, hostname);
  } else if (!wasPurchased && isPurchased) {
    // Remove
    modifiedSave.PlayerSave.data.purchasedServers =
      modifiedSave.PlayerSave.data.purchasedServers.filter(h => h !== hostname);
  }
}
```

### Reset Helpers in Store

Expose reset methods for each section:

```typescript
interface SaveStore {
  resetServer: (hostname: string) => void;
  resetAllServers: () => void;
  resetPlayer: () => void;
  resetFaction: (name: string) => void;
  // ... etc
}
```

UI components call these directly instead of managing resets themselves.

---

## Game Data Constants

Copy these from the old project's `bitburner/data/` folder:

- `ALL_COMPANIES` - All 38 companies
- `ALL_JOB_TITLES` - All 36 job positions
- `COMPANY_JOBS` - Mapping of companies → available jobs
- `ALL_AUGMENTATIONS` - All augmentation names
- `AUGMENTATION_DATA` - Complete metadata (effects, costs, factions, prereqs)

Store in `src/models/constants.ts`:

```typescript
export const ALL_COMPANIES = [
  'ECorp',
  'MegaCorp',
  // ... all 38 companies
] as const;

export const COMPANY_JOBS: Record<string, readonly string[]> = {
  'ECorp': ['Software Engineering Intern', 'IT Intern', /* ... */],
  // ... mappings
};

export const AUGMENTATION_DATA: Record<string, AugmentationData> = {
  'NeuroFlux Governor': {
    name: 'NeuroFlux Governor',
    repCost: 500,
    moneyCost: 750000,
    info: 'A brain implant...',
    multipliers: { /* ... */ },
    factions: ['All factions'],
  },
  // ... all 145 augmentations
};
```

---

## Testing Strategy

### Minimal, High-Value Tests

Focus testing on **save file integrity** only. UI testing is overkill for this project.

**Test these**:
1. ✅ Save file loading (gzipped, base64, JSON formats)
2. ✅ Save file export (roundtrip preserves data)
3. ✅ Cross-reference sync (e.g., purchased servers)
4. ✅ Reset operations (restore exact original state)
5. ✅ Change detection (`hasChanges` accuracy)

**Don't test**:
- ❌ UI components (visual changes frequently)
- ❌ Tailwind classes
- ❌ Simple getters/setters
- ❌ TypeScript types (compiler catches that)

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { loadSaveFile } from './lib/save-loader';

describe('Save File Loader', () => {
  it('should parse gzipped save file', async () => {
    const file = new File([gzippedData], 'test.json.gz');
    const result = await loadSaveFile(file);

    expect(result.ctor).toBe('BitburnerSaveObject');
    expect(result.data.PlayerSave).toBeDefined();
  });

  it('should roundtrip without data loss', async () => {
    const original = await loadSaveFile(sampleFile);
    const exported = await exportSaveFile(original);
    const reloaded = await loadSaveFile(exported);

    expect(reloaded).toEqual(original);
  });
});
```

Run tests: `npm run test`

---

## Development Workflow

### Adding a New Section

1. **Research**: Check Bitburner source at `.bitburner-src-dev/` for data structures
2. **Schema**: Create Zod schema in `models/schemas/[section].ts`
3. **Store**: Add getters and update methods to `save-store.ts`
4. **UI**: Create section component in `components/sections/[Section].tsx`
5. **Route**: Add navigation link in `Navigation.tsx`
6. **Test**: Manually test with real save file

### Updating README Checklist

**CRITICAL**: Mark items complete as you finish them!

```markdown
- [x] Servers section
  - [x] All servers view
  - [x] Purchased servers manager
  - [x] Server details editor
- [ ] Companies section
  - [ ] Company reputation editor
  - [ ] Jobs manager
```

---

## Important Notes

- **Save Compatibility**: Tested with Bitburner Steam version 2.8.1+
- **Data Validation**: Use Zod for runtime validation, never trust user input
- **Exploit Marking**: Auto-add "EditSaveFile" exploit when loading save
- **Change Tracking**: Uses JSON.stringify for deep equality
- **No Backend**: Pure client-side app, all processing in browser
- **Cross-Platform**: Works on Windows/Mac/Linux browsers
- **Faction discovery values**: Real saves use `"known"`, `"unknown"`, and `"rumored"` (not `"rumor"`); normalize `"rumor"` to `"rumored"` if encountered.
- **VersionSave type**: The stringified value parses to a JSON number (e.g., `"43"` -> `43`); accept numeric or string inputs but coerce to a number during parsing.
- **Player multipliers**: These are derived (augs/bitnode/source files/entropy) and should remain read-only; if displayed before recalculation wiring exists, label as informational/not recalculated yet.
- **Multiplier calculator**: `src/lib/multiplier-calculator.ts` recomputes all player multipliers from:
  - **Source Files**: SF1, SF2, SF3, SF5, SF6, SF7, SF8, SF9, SF11 (each with specific field coverage and scaling formulas)
  - **BitNode multipliers**: HackingLevelMultiplier where applicable (BN2/3/6/7/8/9/10)
  - **Exploit bonuses**: 1.001^exploits on eligible fields
  - **Augmentations**: All augs from AUGMENTATION_DATA plus special handling for variable augmentations (see below)
  - **Stanek's Gift fragments**: Uses formula `1 + (ln(highestCharge + 1) / 60) * ((numCharge + 1) / 5)^0.07 * power * boost * stanekPowerMult`. Fragment types affect different multipliers (Rep affects company_rep/faction_rep, WorkMoney affects work_money, etc.). Note: Simplified calculation doesn't account for booster fragment adjacency.
  - **Go/IPvGO bonuses**: Uses formula `1 + ln(nodes + 1) * (nodes + 1)^0.3 * 0.002 * bonusPower * goPowerMult * sourceFileBonus`. Different opponents affect different multipliers (Daedalus affects company_rep/faction_rep, Netburners affects hacknet_node_money, etc.).

  **Variable Augmentation Handling** (critical for matching saved values exactly):

  - **Unstable Circadian Modulator**: This augmentation has 7 possible bonus configurations that rotate hourly based on real-world time. The calculator detects which bonus set was active when the save was created by comparing saved vs computed multipliers:
    - Hacking Performance: hacking_chance 1.25, hacking_speed 1.1, hacking_money 1.25, hacking_grow 1.1
    - Hacking Skill: hacking 1.15, hacking_exp 2
    - Combat Stats: strength/defense/dexterity/agility 1.25, *_exp 2
    - Charisma: charisma 1.5, charisma_exp 2
    - Hacknet: hacknet_node_money 1.2, hacknet_node_*_cost 0.85
    - Work & Reputation: company_rep 1.25, faction_rep 1.15, work_money 1.7
    - Crime: crime_success 2, crime_money 2

  - **NeuroFlux Governor donation bonus**: The game's NFG multiplier is `(1.01 + CONSTANTS.Donations / 1e8)` per level, not exactly 1.01. Since `CONSTANTS.Donations` changes over time (currently ~212, was ~179 earlier), the calculator infers the exact per-level multiplier from the ratio of saved vs computed values. With 300+ NFG levels, even a 0.000002 difference per level compounds to ~0.05% total difference.

  **Principle**: The save file is the source of truth. Instead of using hardcoded values that could differ between game versions, we infer variable bonuses from what's actually stored in the save. This makes the editor robust regardless of when or on which game version the save was created.
- **Player skill levels**: All skill levels (hacking/combat/cha) are recomputed from EXP and multipliers on load; editing level values in the save has no lasting effect. UI should treat levels as read-only and surface EXP editing instead. `src/lib/level-calculator.ts` mirrors the in-game formula (32*log(exp+534.6)-200 with clamp) and applies BitNode LevelMultipliers (BN2/3 hacking 0.8, BN6/7 hacking 0.35, BN9 hacking 0.5 + combat/cha 0.45, BN10 hacking 0.35 + others 0.4, BN11 hacking 0.6, BN12 all stats decaying by 1.02^level, BN13 hacking 0.25 + combat 0.7, BN14 hacking 0.4 + combat 0.5). It uses active source file level for the current BitNode (overrides respected) to drive BN12 decay. Player section now shows original saved level vs computed level per stat.
- **SF9 and Hacknet data structure change (CRITICAL)**: Source File 9 (Hacknet) fundamentally changes how Hacknet data is stored:
  - **Without SF9/BN9**: `hacknetNodes` contains HacknetNode objects with `{ctor: "HacknetNode", data: {name, level, ram, cores, ...}}`
  - **With SF9 or in BN9**: `hacknetNodes` contains strings (hostnames like "hacknet-server-0") that reference HacknetServer entries in `AllServersSave`
  - The game's `hasHacknetServers()` function returns `canAccessBitNodeFeature(9) && !Player.bitNodeOptions.disableHacknetServer`
  - If `hasHacknetServers()` is true but `hacknetNodes` contains HacknetNode objects, the game crashes with "player nodes should not be HacknetNode"
  - **Editor behavior**: When SF9 is added or BN9 is selected (without existing SF9), the store automatically clears `hacknetNodes` and resets `hashManager`. The UI shows a yellow warning explaining the change.
  - **Schema limitation**: The current schema only supports HacknetNode objects. Saves with SF9/BN9 that have Hacknet Servers would need schema updates to properly parse the hostname strings and HacknetServer entries in AllServersSave.

---

## Bitburner Reference Materials

### Local Source Code
- Located at: `.bitburner-src-dev/` (git-ignored)
- Use for reference when implementing features
- Key files:
  - `src/Company/` - Company and job data
  - `src/Faction/` - Faction data
  - `src/Augmentation/` - Augmentation data
  - `src/Server/` - Server data structures

### Official Documentation
- Located at: `.bitburner-src-dev/src/Documentation/doc/en/index.md`

---

## Common Pitfalls

### 1. Forgetting to Sync Cross-References
When updating purchased servers, ALWAYS update both:
- `PlayerSave.data.purchasedServers`
- `AllServersSave[hostname].purchasedByPlayer`

### 2. Not Preserving Array Order
Original array order MUST be preserved for `hasChanges` to work:

```typescript
// BAD
factions.push(newFaction);

// GOOD - insert at original index if restoring
const originalIndex = originalFactions.indexOf(newFaction);
if (originalIndex !== -1) {
  factions.splice(originalIndex, 0, newFaction);
} else {
  factions.push(newFaction);
}
```

### 3. Shallow Copies in Resets
Always use `structuredClone()` or `JSON.parse(JSON.stringify())` for deep clones:

```typescript
// BAD
modifiedSave.AllServersSave[hostname] = originalSave.AllServersSave[hostname];

// GOOD
modifiedSave.AllServersSave[hostname] = structuredClone(
  originalSave.AllServersSave[hostname]
);
```

### 4. Not Validating with Zod
Always validate user-provided data:

```typescript
// BAD
const data = JSON.parse(fileText);

// GOOD
const result = SaveDataSchema.safeParse(data);
if (!result.success) {
  showError(`Invalid save: ${result.error.message}`);
  return;
}
```

### 5. JavaScript Object Key Ordering in JSON.stringify (CRITICAL!)

**Problem**: `JSON.stringify()` serializes object keys in insertion order. When you delete a key and re-add it, the key moves to the end of the object, causing JSON comparison to fail even when data is semantically identical.

**Scenario**: Purchased servers reset was "working" visually but `hasChanges()` still returned `true`.

**Root cause discovered via debugging**:
```
Keys in same order: false
Key order differs at index 73: {original: 'pserv-1', current: 'pserv-2'}
```

When restoring purchased servers:
1. Original `AllServersSave` had keys: `[..., 'pserv-0', 'pserv-1', 'pserv-2', ...]`
2. After delete + restore, keys became: `[..., 'pserv-0', 'pserv-2', ..., 'pserv-1']`
3. `JSON.stringify()` produced different output → `hasChanges()` returned `true`

**Solution**: When resetting data that involves deleting/re-adding object keys, **rebuild the entire object in original key order**:

```typescript
resetPurchasedServers() {
  const { originalSave, currentSave } = get();
  const draft = cloneSave(currentSave);

  // CRITICAL: Rebuild AllServersSave with original key ordering
  const originalKeyOrder = Object.keys(originalSave.AllServersSave);
  const newAllServersSave: typeof draft.AllServersSave = {};

  for (const hostname of originalKeyOrder) {
    if (originalPurchasedSet.has(hostname)) {
      // Purchased server - restore from original
      newAllServersSave[hostname] = structuredClone(originalSave.AllServersSave[hostname]);
    } else {
      // Not a purchased server - keep current state
      newAllServersSave[hostname] = draft.AllServersSave[hostname] ??
        structuredClone(originalSave.AllServersSave[hostname]);
    }
  }

  draft.AllServersSave = newAllServersSave;
  // ... rest of reset logic
}
```

**When to apply this pattern**:
- Any reset that touches objects where keys may have been added/removed
- Resets involving cross-references (e.g., purchased servers touches 3 places)
- Any operation where you're restoring "deleted" items back to an object

**Debugging approach**:
1. Add console logging to compare key orders:
   ```typescript
   const originalKeys = Object.keys(originalSave.AllServersSave);
   const currentKeys = Object.keys(currentSave.AllServersSave);
   console.log('Keys in same order:', JSON.stringify(originalKeys) === JSON.stringify(currentKeys));
   ```
2. Find first key order difference to identify the problem area
3. Implement key-order-preserving rebuild

---

## Faction Metadata

Comprehensive faction metadata is stored in `src/models/faction-data.ts`, extracted from Bitburner v2.6.2+ source code.

### Metadata Fields

Each faction has the following metadata:
- **Category**: Early Game, City, Hacker Group, Megacorporation, Criminal, Endgame, or Special
- **Cities**: Associated city locations (e.g., Aevum, Chongqing)
- **Company**: Associated company for corporate factions (e.g., ECorp, MegaCorp)
- **Enemies**: List of mutually exclusive factions
- **Work Types**: Hacking, Field, and/or Security work availability
- **Requirements**: Human-readable join requirements (e.g., "$40m", "Hacking 100")

### Enemy Factions

City factions have enemy relationships - joining one prevents joining its enemies:
- **Aevum** ↔ Chongqing, New Tokyo, Ishima, Volhaven
- **Chongqing** ↔ Sector-12, Aevum, Volhaven
- **Ishima** ↔ Sector-12, Aevum, Volhaven
- **New Tokyo** ↔ Sector-12, Aevum, Volhaven
- **Sector-12** ↔ Chongqing, New Tokyo, Ishima, Volhaven
- **Volhaven** ↔ All other city factions

Red octagon icon with exclamation point displays for factions with enemies. Tooltip lists all enemy factions.

### Work Types

Factions offer different types of work to earn reputation:
- **Hacking Work** - Programming/hacking tasks (green ">|" icon)
- **Field Work** - Physical/intelligence work (blue compass icon)
- **Security Work** - Combat/security tasks (white shield with star icon)

Special factions (Bladeburners, Church of the Machine God, Shadows of Anarchy) don't offer standard work.

### Helper Functions

- `getFactionMetadata(name)` - Returns full metadata for a faction
- `getCompanyFactions()` - Returns all megacorporation factions
- `getFactionsByCity(city)` - Returns factions in a specific city
- `getFactionsByCategory(category)` - Returns factions by category
- `offersWork(name)` - Checks if faction offers any work type

### UI Display

Faction cards display:
- Category and discovery status
- Associated cities and company
- Work type icons with tooltips
- Enemy faction warning icon
- Join requirements (human-readable bullet list)

---

## Document Maintenance Log

*Track significant updates to this context document here.*

- **2025-12-02** - Progression → Exploits tab fully implemented. Created `src/models/data/exploits.ts` with all 11 Bitburner exploits (Bypass, PrototypeTampering, Unclickable, UndocumentedFunctionCall, TimeCompression, RealityAlteration, N00dles, YoureNotMeantToAccessThis, TrueRecursion, INeedARainbow, EditSaveFile). Each exploit has metadata including description, hint, and difficulty (Easy/Medium/Hard/Secret). Store exposes `addExploit`, `removeExploit`, `resetExploits`, and `hasExploitChanges`. UI shows Source-File -1 bonus overview (stat multiplier and cost reduction calculations), filterable exploit cards with checkboxes, bulk add/remove all buttons, and difficulty-colored badges. Exploits grant `1.001^count` bonus to most stats and `0.999^count` reduction to hacknet costs.
- **2025-12-01** - Settings → Theme tab fully implemented. Created new `ColorInput` UI component (`src/components/ui/ColorInput.tsx`) combining a color swatch button (triggers native color picker) with hex text input. Theme tab allows editing all 38 Bitburner theme colors organized into 10 groups: Primary, Success, Error, Secondary, Warning, Info, UI, Background & Buttons, Game Stats, and BitNode Levels. Includes preset theme selector (Default, Dracula, Monokai'ish) and live preview panel showing selected colors in context. Overview panel now shows color swatches for quick theme identification. Theme colors stored in `settings.theme` object with keys matching Bitburner's `ITheme` interface.
- **2025-12-01** - Settings → Script Editor tab fully implemented. Covers all Monaco editor settings: theme (Monokai, Solarized Dark/Light, Dracula, One Dark), font (family, size, ligatures), indentation (spaces vs tabs, tab size, auto-detect), behavior (Vim mode, word wrap, beautify on save), and cursor (style, blinking animation). Uses `Select` component for dropdowns with options defined as constants. Overview panel updated to show current theme name, font config, and Vim mode status.
- **2025-11-30** - Fixed SF9/Hacknet crash: When SF9 (Source File 9) is enabled or BN9 is selected, the game expects `hacknetNodes` to contain hostname strings (for HacknetServers in AllServersSave) instead of HacknetNode objects. The store now automatically clears `hacknetNodes` and resets `hashManager` when SF9/BN9 access changes. UI shows yellow warning in Progression → Source Files when SF9 is enabled explaining the change. HacknetSection now detects SF9/BN9 mode and disables the Hacknet Nodes tab with a detailed warning, preventing users from adding incompatible HacknetNode objects. Added documentation to Important Notes section.
- **2025-11-30** - Added comprehensive tab stubs for all remaining sections:
  - **HacknetSection**: Two tabs (Nodes, Hash Manager) with overview showing node count, total money generated, hash stats. Nodes tab covers add/remove nodes, edit levels/RAM/cores. Hash Manager tab covers hashes, capacity, and upgrades.
  - **ProgressionSection**: Three tabs (BitNode & Source Files, Exploits, Playtime Stats) with overview showing current BitNode, source file count, exploit count, total playtime.
  - **BusinessSection**: Three tabs (Corporation, Bladeburner, Sleeves) for endgame systems. All marked as "schema implementation required" since `corporation`, `bladeburner`, and `sleeves` are stored as `z.unknown()` in player schema. Hidden developer notes explain complexity.
  - **StockMarketSection**: Three tabs (Access & Settings, Positions, Orders) with overview showing WSE account, TIX API, 4S Data, 4S TIX API flags. Access tab uses existing player flags; Positions/Orders need Stock schema implementation.
  - **SpecialSection**: Three tabs (Stanek's Gift, Go/IPvGO, Infiltrations) with overview showing unlock status. Stanek covers fragment grid/charges. Go covers board state and opponent stats. Infiltrations noted as "live minigame" with minimal save data.
  - **SettingsSection**: Three tabs (General, Script Editor, Theme) for game settings. General tab fully implemented with autosave, locale, suppress flags, display options, terminal settings, capacity limits, number formatting, save options, remote file API, and misc settings. Script Editor tab fully implemented with theme, font, indentation, behavior, and cursor settings. Theme tab fully implemented with color picker for all 38 theme colors.
  - **ScriptsSection**: New section for viewing/editing scripts stored in `AllServersSave[hostname].scripts`. Overview shows total scripts, servers with scripts, top server. Stub describes VS Code-style file browser + text editor UI. Scripts have `filename`, `code`, and `server` properties.
  - All stubs include hidden developer notes (text-black) explaining implementation requirements without being visible to users.
- **2025-12-01** - Multiplier calculator now matches saved values exactly by inferring variable bonuses: (1) Unstable Circadian Modulator detection - identifies which of 7 time-based bonus sets was active when save was created; (2) NeuroFlux Governor donation bonus inference - derives exact per-level multiplier from saved/computed ratio since CONSTANTS.Donations changes over time. Principle: save file is source of truth, not hardcoded game values.
- **2025-11-30** - Gang section implemented with overview panel (Stats, Faction, Settings, Current Rates columns) and tab scaffold (Members, Equipment, Territory). Overview includes editable gang stats (respect, wanted, territory clash chance as 0-100%), gang settings toggles (territory warfare, notify on death), and read-only rates. Gang faction reputation/favor surfaced in Gang section for convenience (same fields as Factions page). Store exposes `updateGangStats`, `resetGang`, and `hasGangChanges`. Reset and change detection include the gang faction's data so "Reset All Gang Data" also resets faction rep/favor. Company schema updated to make `playerReputation` optional with default 0 (fixes saves where companies have only favor).
- **2025-11-30** - Added critical documentation about JavaScript object key ordering issue with `JSON.stringify()` in "Common Pitfalls" section. When resetting data that involves deleting/re-adding object keys (like purchased servers), the entire object must be rebuilt in original key order to ensure `hasChanges()` detection works correctly. Includes code example, debugging approach, and scenarios where this pattern applies.
- **2025-11-29** - Augmentation data updated with complete list from Bitburner v2.6.2 source (123 augmentations total). Corrected naming: SoA augmentations now use "SoA - " prefix (e.g., "SoA - Beauty of Aphrodite"); "EsperTech Bladeburner Eyewear" (not "Esper Eyewear"); "GOLEM Serum" (not "Golem Serum"); "I.N.T.E.R.L.I.N.K.E.D" (with periods). Includes all 9 Shadows of Anarchy augmentations, all 17 Bladeburner augmentations, all 3 Stanek's Gift augmentations, and NeuroFlux Governor with complete multiplier data.
- **2025-11-29** - Companies section implemented with reputation/favor editors and job management. Store exposes `updateCompanyStats`, `setCurrentJob`, `resetCompany`, `resetCompanies`, and `hasCompanyChanges`. Company data (ALL_COMPANIES, COMPANY_JOBS, COMPANY_CITY_MAP) stored in `src/models/company-data.ts`. UI includes search, city filter, and status filters (employed/has reputation/modified). Job dropdown validates against available positions per company.
- **2025-11-29** - Factions section filters now include a corporate-only toggle and a city dropdown; company/city metadata is defined in `src/components/sections/FactionsSection.tsx` (`companyFactions` and `factionCityMap`, derived from Bitburner `FactionInfo`) for filter logic.
- **2025-11-29** - Added faction metadata system with enemy factions and work type indicators. `src/models/faction-data.ts` contains metadata extracted from Bitburner FactionInfo (enemies, offerHackingWork, offerFieldWork, offerSecurityWork). New UI components: `Tooltip` (terminal-styled hover tooltips), `FactionIcons` (work type and enemy faction indicators), `HackingWorkIcon` (green ">|"), `SecurityWorkIcon` (white shield with star), `FieldWorkIcon` (blue compass), `EnemyFactionIcon` (red octagon with exclamation). Icons display in faction cards with hover tooltips explaining work types and listing enemy factions.
- **2025-11-29** - Expanded faction metadata to include comprehensive data: categories (Early Game, City, Hacker Group, Megacorporation, Criminal, Endgame, Special), associated cities, company affiliations, and human-readable join requirements. Added helper functions: `getCompanyFactions()`, `getFactionsByCity()`, `getFactionsByCategory()`, `getAllCities()`, `offersWork()`. Faction cards now display category, cities, company, and requirements list. Removed ALL hardcoded faction metadata from FactionsSection (companyFactions, factionCityMap, cityOptions) - city filter dropdown now dynamically populated from `getAllCities()`. Single source of truth is `faction-data.ts`.
- **2025-12-03** - Factions section bulk actions now mirror Augmentations: cards have selection checkboxes; bulk bar uses tri-state toggles for member/invited/banned; bulk set favor/reputation now uses a modal; discovery bulk buttons removed.
- **2025-12-03** - `Checkbox` UI component supports tri-state (`triState` + `state`/`onStateChange`) with an indeterminate glyph; used for faction bulk toggles.

- **2025-12-03** - Augmentation prerequisites enforced via UI disabling (install requires installed prereqs; queue requires owned prereqs); automatic cascading/demotion was removed—status changes now only touch the targeted augmentation. Cards still show prereq warnings. Use canonical augmentation names when writing to save; rely on `nameMatchesAugmentation` for alias lookups.
- **2025-12-02** - Factions section implemented with membership/invite toggles, discovery/banned controls, and rep/favor editors. Store exposes `updateFactionStats`, `setFactionMembership`, `setFactionInvitation`, `resetFaction`, `resetFactions`, and `hasFactionChanges`; faction schema now allows `isMember`. Membership/invitation helpers sync PlayerSave arrays with FactionsSave flags and preserve original ordering on resets.
- **2025-12-02** - CordiARC aug canonical name corrected to "CordiARC Fusion Reactor"; alias accepts legacy "Cordiax Proprietary ARC Reactor".
- **2025-12-02** - Corrected ADR Pheromone canonical names to match game (`ADR-V1/ADR-V2 Pheromone Gene`); alias map now accepts legacy labels (e.g., "ADR Pheromone 1"). Install/export should now match in-game naming.
- **2025-12-02** - Fixed ADR Pheromone naming mismatch (should be ADR-V1/ADR-V2). Added alias handling so old saves resolve; augmentation writes now use canonical display names with aliases stripped to avoid duplicates.
- **2025-12-02** - Augmentation edits now save the canonical display name instead of internal keys; exports previously using slug keys could fail to install in-game. Status changes also strip both slug/name duplicates before writing.
- **2025-11-29** - Added CRITICAL section in Terminal Theme System reminding LLMs to ALWAYS check `src/components/ui/index.ts` and search for existing components before implementing UI elements. Lists all available components with brief descriptions to prevent reimplementing existing functionality.
- **2025-11-29** - Augmentations section now includes bulk selection/actions UI: checkboxes on cards (using `Checkbox` component), "Select All Filtered" button, and bulk status change buttons (Set Installed/Queued/None). Filters reorganized into compact single-box layout with search, status, and effect filters side-by-side (2-column grid on large screens). Clear All button positioned in upper-right of filter box.
- **2025-11-29** - Augmentations section fully reimplemented with proper NeuroFlux Governor handling. CRITICAL: NeuroFlux has asymmetric storage - **installed** is a SINGLE entry with max level, **queued** is MULTIPLE entries (one per level from installed+1 to queued). Regular augmentations use status dropdown (none/queued/installed). Store uses `mutateCurrentSave` for direct array manipulation rather than individual add/remove/update methods. Separate NeuroFlux card with dual inputs; regular augs show only current save augs (no static list).
- **2025-12-02** - HP computation now takes the greater of saved defense level and recomputed level from EXP/mults to better mirror in-game HP when save multipliers are stale; UI labels HP as in-game vs raw values.
- **2025-12-04** - Servers section implemented with search/filters and editable cards. Store exposes `updateServerStats`, `resetServer` (also restores purchasedServers membership to the original ordering), `resetAllServers`, and `hasServerChanges`. UI badges purchased/modified status, hides money/security editors when the fields are undefined, and uses JSON.stringify comparison to detect per-server modifications.
- **2025-12-04** - Hacknet Nodes tab implemented with full CRUD support. Store exposes `updateHacknetNode`, `addHacknetNode`, `removeHacknetNode`, `resetHacknetNodes`, and `hasHacknetNodeChanges`. UI includes HacknetNodeCard (expandable with level/RAM/cores/stats editors), AddHacknetNodeModal, AddMaxNodesModal (bulk add with configurable count), ModifyAllNodesModal (bulk edit), search/filter controls, and delete all functionality. Constants from Bitburner source: MaxLevel=200, MaxRAM=64, MaxCores=16. RAM must be powers of 2 (1-64). Hash Manager tab remains a stub (marked notImplemented).

- **2025-12-01** - Player section reset button renamed to "Reset Stats & Skills" and now calls `resetPlayerStats` in the store, which only restores hp/skills/exp/mults from the original save (money/resources and other player fields remain unchanged).
- **2025-12-01** - Player section now hides the stats reset button when there are no stat/skill changes (shows "No Modifications"); uses store helper `hasPlayerStatChanges` that scopes comparison to hp/skills/exp/mults.
- **2025-12-01** - Added reusable `ResetAction` UI component (button or "No Modifications" label) with configurable title; PlayerSection now uses it for stats and resources.
- **2025-12-01** - Store now exposes `resetPlayerResources` and `hasPlayerResourceChanges` to scope reset/change detection to money/karma/entropy; Money/Karma/Entropy card wired to `ResetAction`.
- **2025-12-01** - NumberInput now applies its value on Enter and blurs the field (same as blur behavior), ensuring edits commit when pressing Enter. Input and Textarea now also blur on Enter (after calling user onKeyDown handlers).
- **2025-12-01** - Added HP computation helper (`computeHealthStats`) mirroring in-game logic (max = floor(10 + defense/10); current preserves saved ratio); PlayerSection now shows saved vs computed HP with diff tags. New vitest `src/lib/hp-calculator.test.ts`; `npm test` runs both multiplier and HP tests.
- **2025-11-30** - Added skill level calculator (`src/lib/level-calculator.ts`) with BitNode LevelMultipliers (SF override aware) and wired Player stats UI to show original saved level vs computed level per stat alongside EXP editors.
- **2025-11-29** - Added hacking multiplier calculator helper plus UI/readout (saved vs computed) and a vitest for sample save; future multipliers can extend the helper.
- **2025-11-29** - Player stat level inputs removed; levels are now displayed read-only since the game recomputes them from EXP/multipliers on load (EXP remains editable).
- **2025-11-29** - Player section now includes stats/exp editor plus money/karma/entropy controls; added save-store helpers (`updatePlayerSkill/Exp/Hp/Resources`, `resetPlayer` clones original PlayerSave).
- **2025-11-29** - HP editing now auto-raises max HP when current HP is set above it (`updatePlayerHp` logic in save store) to keep values consistent.
- **2025-11-29** - Player HP now displayed read-only in the UI with note (Bitburner recomputes HP from stats on load); editing removed from Player section.
- **2025-11-29** - Save parsing now treats empty strings for optional sections (e.g., AllGangsSave) as absent instead of throwing JSON parse errors; optional keys set documented in `parseSaveData`.
- **2025-11-29** - Editor shell now shows "Download Modified Save" when there are changes; uses `downloadSaveFile` with format derived from original (gzipped -> json-gz, else json) and filename based on uploaded name.
- **2025-11-29** - Downloaded save filenames now append `_HaCk3D` before the extension (e.g., `name_HaCk3D.json` or `name_HaCk3D.json.gz`).
- **2025-11-29** - Save export now preserves optional save section keys (StockMarket/Settings/Version/Aliases/GlobalAliases/AllGangs/LastExportBonus/StaneksGift/Go/Infiltrations) as empty strings if absent, matching Bitburner’s expected key set on import.
- **2025-11-29** - Export now reuses original raw section strings when unchanged (uses original parsed + raw data captured on load) to minimize diffs; loadFromFile stores originalRawData alongside parsed saves.
- **2025-11-29** - Export supports base64 output to mirror original save format (`base64` when original format detected as base64); download button picks format based on detected save type.
- **2025-11-29** - Adjusted schemas: faction discovery now normalizes `"rumor"`/`"rumored"` values; VersionSave coerces numeric strings to numbers for parsing.
- **2025-11-29** - Stubbed game-centric section navigation via `GameSectionTabs` and `SectionStub` placeholders for all primary editor areas.
- **2025-11-29** - Added Zustand save store implementation details (immutable original vs editable current, load/reset helpers) and EditorShell wiring for load/revert UX.
- **2025-11-29** - Documented App/Layout refactor: App now toggles EditorShell vs ComponentDemo via query params; shared chrome extracted to `AppLayout.tsx`.
- **2025-11-28** - Initial document creation for V2 rewrite

