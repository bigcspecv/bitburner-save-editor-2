import { z } from 'zod';

/**
 * Stock Market schema - for stock trading data
 */
export const StockMarketSaveSchema = z.object({
  hasWseAccount: z.boolean().optional(),
  hasTixApiAccess: z.boolean().optional(),
  has4SData: z.boolean().optional(),
  has4SDataTixApi: z.boolean().optional(),
  // Additional stock market data can be added as needed
}).passthrough(); // Allow additional fields

/**
 * Settings schema - game settings
 */
export const SettingsSaveSchema = z.object({
  // Settings are highly variable, so we use passthrough
}).passthrough();

/**
 * Version schema - save file version info
 *
 * Real saves store this as a JSON number; older/other variants may stringify it.
 * Coerce both to a number to keep downstream handling consistent.
 */
export const VersionSaveSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number());

/**
 * Aliases schema - terminal aliases
 */
export const AliasesSaveSchema = z.record(z.string(), z.string());

/**
 * Global Aliases schema - global terminal aliases
 */
export const GlobalAliasesSaveSchema = z.record(z.string(), z.string());

/**
 * All Gangs Save - gang information across all bitnodes
 */
export const AllGangsSaveSchema = z.unknown(); // Can be refined later

/**
 * Last Export Bonus - bonus from last export
 */
export const LastExportBonusSchema = z.number();

/**
 * Stanek's Gift Save - data for Stanek's Gift mechanic
 */
export const StaneksGiftSaveSchema = z.unknown(); // Can be refined later

/**
 * Go Save - data for the Go minigame
 */
export const GoSaveSchema = z.unknown(); // Can be refined later

/**
 * Infiltrations Save - infiltration mission data
 */
export const InfiltrationsSaveSchema = z.unknown().optional(); // Can be refined later

export type StockMarketSave = z.infer<typeof StockMarketSaveSchema>;
export type SettingsSave = z.infer<typeof SettingsSaveSchema>;
export type VersionSave = z.infer<typeof VersionSaveSchema>;
export type AliasesSave = z.infer<typeof AliasesSaveSchema>;
export type GlobalAliasesSave = z.infer<typeof GlobalAliasesSaveSchema>;
export type AllGangsSave = z.infer<typeof AllGangsSaveSchema>;
export type LastExportBonus = z.infer<typeof LastExportBonusSchema>;
export type StaneksGiftSave = z.infer<typeof StaneksGiftSaveSchema>;
export type GoSave = z.infer<typeof GoSaveSchema>;
export type InfiltrationsSave = z.infer<typeof InfiltrationsSaveSchema>;
