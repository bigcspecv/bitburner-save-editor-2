# Bitburner Save File Schemas

This directory contains Zod schemas for validating and parsing Bitburner save files.

## Overview

Bitburner save files follow a specific structure:
- Top level: `BitburnerSaveObject` with a `ctor` and `data` field
- The `data` field contains keys like `PlayerSave`, `AllServersSave`, etc.
- **Important**: In the raw save file, each value in `data` is a **stringified JSON string**
- We use Zod to validate the structure and provide type safety

## File Structure

```
schemas/
├── base.ts          # Base schemas and utility functions
├── player.ts        # Player-related schemas (skills, exp, augs, gang, etc.)
├── server.ts        # Server and script schemas
├── faction.ts       # Faction schemas
├── company.ts       # Company schemas
├── misc.ts          # Miscellaneous schemas (stock market, settings, etc.)
├── index.ts         # Main export and parsing utilities
└── README.md        # This file
```

## Usage

### Loading and Parsing a Save File

```typescript
import { loadAndParseSaveFile } from '../lib/save-loader';

// Load a save file
const file: File = /* from file input */;
const saveData = await loadAndParseSaveFile(file);

// Now you have fully typed, validated save data
console.log(saveData.PlayerSave.data.money); // TypeScript knows this is a number
console.log(saveData.PlayerSave.data.skills.hacking); // Fully typed!
```

### Validating Individual Sections

```typescript
import {
  validatePlayerSave,
  validateAllServersSave,
  validateFactionsSave,
} from '../models/schemas';

// Validate a player save section
const playerSave = validatePlayerSave(someData);

// Validate all servers
const servers = validateAllServersSave(serverData);
```

### Exporting a Modified Save File

```typescript
import { downloadSaveFile } from '../lib/save-exporter';

// After modifying the save data
saveData.PlayerSave.data.money = 999999999;
saveData.PlayerSave.data.skills.hacking = 1000;

// Export as JSON
downloadSaveFile(saveData, 'my-save', 'json');

// Export as gzipped JSON
downloadSaveFile(saveData, 'my-save', 'json-gz');
```

## Schema Organization

### Base Schemas (`base.ts`)

- `BitburnerSaveObjectSchema` - Top-level save file structure
- `SaveDataKeySchema` - Valid save section keys
- `createCtorSchema()` - Helper for creating ctor-based objects
- `createJSONMapSchema()` - Helper for Bitburner's Map serialization
- `createJSONSetSchema()` - Helper for Bitburner's Set serialization

### Player Schemas (`player.ts`)

Comprehensive player data including:
- HP, skills, experience, multipliers
- Augmentations (installed and queued)
- Gang data and gang members
- Hacknet nodes
- Money tracking
- Work status
- Achievements
- And much more...

### Server Schemas (`server.ts`)

- Server properties (RAM, cores, security, money)
- Scripts and their code
- Programs and messages
- Port status

### Faction Schemas (`faction.ts`)

- Faction discovery status
- Player reputation
- Favor

### Company Schemas (`company.ts`)

- Company reputation
- Employment status

### Miscellaneous Schemas (`misc.ts`)

- Stock market data
- Settings
- Version info
- Aliases
- Stanek's Gift, Go, Infiltrations, etc.

## Type Safety

All schemas export TypeScript types:

```typescript
import type {
  ParsedSaveData,
  PlayerSave,
  PlayerData,
  Server,
  Faction,
  Company,
} from '../models/schemas';

// Use these types in your components
function editPlayerMoney(player: PlayerData, newAmount: number) {
  player.money = newAmount;
}
```

## Extending Schemas

To add support for new save sections or fields:

1. **Add the schema to the appropriate file** (or create a new one)
2. **Export the schema and type** from that file
3. **Re-export from `index.ts`**
4. **Add to `ParsedSaveDataSchema`** if it's a top-level section
5. **Add validation helper** if needed

Example:

```typescript
// In misc.ts
export const MyNewSectionSchema = z.object({
  someField: z.string(),
  anotherField: z.number(),
});

export type MyNewSection = z.infer<typeof MyNewSectionSchema>;

// In index.ts
export * from './misc';
import { MyNewSectionSchema } from './misc';

export const ParsedSaveDataSchema = z.object({
  // ... existing sections
  MyNewSection: MyNewSectionSchema.optional(),
});
```

## Schema Patterns

### Objects with `ctor` field

Many Bitburner objects follow this pattern:
```json
{
  "ctor": "SomeObject",
  "data": { /* actual data */ }
}
```

Use `createCtorSchema()`:
```typescript
const MySchema = createCtorSchema('SomeObject', z.object({
  field1: z.string(),
  field2: z.number(),
}));
```

### Maps

Bitburner serializes Maps as:
```json
{
  "ctor": "JSONMap",
  "data": [["key1", "value1"], ["key2", "value2"]]
}
```

Use `createJSONMapSchema()`:
```typescript
const MyMapSchema = createJSONMapSchema(z.string(), z.number());
```

### Sets

Bitburner serializes Sets as:
```json
{
  "ctor": "JSONSet",
  "data": ["item1", "item2"]
}
```

Use `createJSONSetSchema()`:
```typescript
const MySetSchema = createJSONSetSchema(z.string());
```

## Validation Errors

When validation fails, Zod provides detailed error messages:

```typescript
try {
  const saveData = await loadAndParseSaveFile(file);
} catch (error) {
  // Error will include path to invalid field
  console.error('Validation failed:', error);
}
```

## Optional vs Required Fields

- Use `.optional()` for fields that may not exist in all save files
- Use passthrough schemas (`.passthrough()`) for objects with variable fields
- Use `z.unknown()` for sections that haven't been fully typed yet

## Performance Considerations

- Schemas are validated once when loading the save file
- After validation, you have full type safety with zero runtime overhead
- Large save files (with many servers/scripts) may take a moment to validate

## Contributing

When adding new schemas:
1. Match the Bitburner save file structure exactly
2. Use optional fields for data that may not always be present
3. Add JSDoc comments to explain complex fields
4. Export types for use in components
5. Test with actual save files
