# Bitburner Save Editor V2 - LLM Context

## IMPORTANT: Instructions for LLM Agents

**This document serves as persistent memory across chat sessions. Follow these guidelines:**

1. **Maintain this document**: When you discover important architectural decisions, patterns, gotchas, or implementation details during your work, add them to the appropriate section of this document. This ensures future AI agents have the context they need.

2. **Update the README checklist**: The `README.md` file contains a TODO checklist that tracks project progress. You MUST:
   - Mark items as complete `[x]` when you finish implementing them
   - Add new checklist items when you identify additional work needed
   - Keep sub-items organized under their parent features
   - Maintain the existing format and structure

3. **Document patterns**: If you establish a new pattern or convention while working on a feature, document it here so future implementations remain consistent.

4. **Note breaking changes**: If you discover version-specific behavior or compatibility issues, document them in the "Important Notes" section.

5. **This file is for LLMs**: Write for other AI agents, not humans. Be concise but comprehensive. Focus on what an LLM needs to work effectively on this codebase.

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
- **Multiplier calculator**: `src/lib/multiplier-calculator.ts` recomputes all player multipliers from Source-File 1/2/5 (see field coverage), BitNode HackingLevelMultiplier (where applicable), exploit bonuses (1.001^exploits on eligible fields), and augs we currently map (NFG across all, BitWire, Neurotrainer I exp bonuses, Synaptic Enhancement Implant hacking_speed) plus donation bonus. Player section shows saved vs computed multipliers with rounding/tolerance; vitest in `src/lib/multiplier-calculator.test.ts`.
- **Player skill levels**: All skill levels (hacking/combat/cha) are recomputed from EXP and multipliers on load; editing level values in the save has no lasting effect. UI should treat levels as read-only and surface EXP editing instead.

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

---

## Document Maintenance Log

*Track significant updates to this context document here.*

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

