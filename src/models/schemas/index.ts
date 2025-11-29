/**
 * Central export for all Bitburner save file schemas.
 * This file provides the main validation utilities and type exports.
 */

import { z } from 'zod';

// Re-export all schemas
export * from './base';
export * from './player';
export * from './server';
export * from './faction';
export * from './company';
export * from './misc';

// Import for local use
import { BitburnerSaveObjectSchema } from './base';
import { PlayerSaveSchema } from './player';
import { AllServersSaveSchema } from './server';
import { FactionsSaveSchema } from './faction';
import { CompaniesSaveSchema } from './company';
import {
  StockMarketSaveSchema,
  SettingsSaveSchema,
  VersionSaveSchema,
  AliasesSaveSchema,
  GlobalAliasesSaveSchema,
  AllGangsSaveSchema,
  LastExportBonusSchema,
  StaneksGiftSaveSchema,
  GoSaveSchema,
  InfiltrationsSaveSchema,
} from './misc';

/**
 * Schema for the parsed save data (after parsing stringified JSON values).
 * This is what you work with after calling parseSaveData().
 */
export const ParsedSaveDataSchema = z.object({
  PlayerSave: PlayerSaveSchema,
  AllServersSave: AllServersSaveSchema,
  FactionsSave: FactionsSaveSchema,
  CompaniesSave: CompaniesSaveSchema,
  StockMarketSave: StockMarketSaveSchema.optional(),
  SettingsSave: SettingsSaveSchema.optional(),
  VersionSave: VersionSaveSchema.optional(),
  AliasesSave: AliasesSaveSchema.optional(),
  GlobalAliasesSave: GlobalAliasesSaveSchema.optional(),
  AllGangsSave: AllGangsSaveSchema.optional(),
  LastExportBonus: LastExportBonusSchema.optional(),
  StaneksGiftSave: StaneksGiftSaveSchema.optional(),
  GoSave: GoSaveSchema.optional(),
  InfiltrationsSave: InfiltrationsSaveSchema.optional(),
});

export type ParsedSaveData = z.infer<typeof ParsedSaveDataSchema>;

const OPTIONAL_SAVE_KEYS: Set<string> = new Set([
  'StockMarketSave',
  'SettingsSave',
  'VersionSave',
  'AliasesSave',
  'GlobalAliasesSave',
  'AllGangsSave',
  'LastExportBonus',
  'StaneksGiftSave',
  'GoSave',
  'InfiltrationsSave',
]);

/**
 * Validates the raw BitburnerSaveObject structure
 */
export function validateRawSave(data: unknown): z.infer<typeof BitburnerSaveObjectSchema> {
  return BitburnerSaveObjectSchema.parse(data);
}

/**
 * Parses and validates a BitburnerSaveObject, converting stringified JSON to objects.
 * This is the main function you'll use to work with save files.
 */
export function parseSaveData(rawSave: z.infer<typeof BitburnerSaveObjectSchema>): ParsedSaveData {
  // Parse each stringified JSON value in the data object
  const parsed: Record<string, unknown> = {};

  for (const [key, stringifiedValue] of Object.entries(rawSave.data)) {
    try {
      const trimmed = stringifiedValue.trim();

      // Some optional sections (e.g., AllGangsSave when never unlocked) serialize as empty strings.
      // Skip parsing those so optional schema fields remain undefined instead of throwing.
      if (trimmed === '' && OPTIONAL_SAVE_KEYS.has(key)) {
        continue;
      }

      parsed[key] = JSON.parse(stringifiedValue);
    } catch (error) {
      throw new Error(`Failed to parse save section "${key}": ${error}`);
    }
  }

  // Validate the parsed data against our schema
  return ParsedSaveDataSchema.parse(parsed);
}

/**
 * Converts ParsedSaveData back to BitburnerSaveObject format (with stringified values).
 */
export function serializeSaveData(parsedData: ParsedSaveData): z.infer<typeof BitburnerSaveObjectSchema> {
  const data: Record<string, string> = {};

  for (const [key, value] of Object.entries(parsedData)) {
    if (value !== undefined) {
      data[key] = JSON.stringify(value);
    }
  }

  // Preserve optional sections even when absent (Bitburner includes these keys with empty strings).
  for (const key of OPTIONAL_SAVE_KEYS) {
    if (!(key in data)) {
      data[key] = '';
    }
  }

  return {
    ctor: 'BitburnerSaveObject',
    data,
  };
}

/**
 * Validates partial save data - useful for editing individual sections
 */
export function validatePlayerSave(data: unknown) {
  return PlayerSaveSchema.parse(data);
}

export function validateAllServersSave(data: unknown) {
  return AllServersSaveSchema.parse(data);
}

export function validateFactionsSave(data: unknown) {
  return FactionsSaveSchema.parse(data);
}

export function validateCompaniesSave(data: unknown) {
  return CompaniesSaveSchema.parse(data);
}
