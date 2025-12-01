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
 * Based on Bitburner's Settings.ts
 */
export const SettingsSaveSchema = z.object({
  // General Settings
  AutosaveInterval: z.number().optional(),
  Locale: z.string().optional(),
  TimestampsFormat: z.string().optional(),

  // Display Options
  DisableASCIIArt: z.boolean().optional(),
  DisableHotkeys: z.boolean().optional(),
  DisableTextEffects: z.boolean().optional(),
  DisableOverviewProgressBars: z.boolean().optional(),
  IsSidebarOpened: z.boolean().optional(),

  // Terminal & Bash
  EnableBashHotkeys: z.boolean().optional(),
  EnableHistorySearch: z.boolean().optional(),

  // Capacity Limits
  MaxRecentScriptsCapacity: z.number().optional(),
  MaxLogCapacity: z.number().optional(),
  MaxPortCapacity: z.number().optional(),
  MaxTerminalCapacity: z.number().optional(),

  // Suppress Dialog Options
  SuppressBuyAugmentationConfirmation: z.boolean().optional(),
  SuppressErrorModals: z.boolean().optional(),
  SuppressFactionInvites: z.boolean().optional(),
  SuppressMessages: z.boolean().optional(),
  SuppressTravelConfirmation: z.boolean().optional(),
  SuppressBladeburnerPopup: z.boolean().optional(),
  SuppressTIXPopup: z.boolean().optional(),
  SuppressSavedGameToast: z.boolean().optional(),
  SuppressAutosaveDisabledWarnings: z.boolean().optional(),

  // Number Formatting
  UseIEC60027_2: z.boolean().optional(),
  ShowMiddleNullTimeUnit: z.boolean().optional(),
  hideTrailingDecimalZeros: z.boolean().optional(),
  hideThousandsSeparator: z.boolean().optional(),
  useEngineeringNotation: z.boolean().optional(),
  disableSuffixes: z.boolean().optional(),

  // Remote File API
  RemoteFileApiAddress: z.string().optional(),
  RemoteFileApiPort: z.number().optional(),
  RemoteFileApiReconnectionDelay: z.number().optional(),
  UseWssForRemoteFileApi: z.boolean().optional(),

  // Save Options
  SaveGameOnFileSave: z.boolean().optional(),
  ExcludeRunningScriptsFromSave: z.boolean().optional(),

  // Script Editor Settings
  MonacoTheme: z.string().optional(),
  MonacoInsertSpaces: z.boolean().optional(),
  MonacoTabSize: z.number().optional(),
  MonacoDetectIndentation: z.boolean().optional(),
  MonacoFontFamily: z.string().optional(),
  MonacoFontSize: z.number().optional(),
  MonacoFontLigatures: z.boolean().optional(),
  MonacoDefaultToVim: z.boolean().optional(),
  MonacoWordWrap: z.string().optional(),
  MonacoBeautifyOnSave: z.boolean().optional(),
  MonacoCursorStyle: z.string().optional(),
  MonacoCursorBlinking: z.string().optional(),

  // Active Scripts Display
  ActiveScriptsServerPageSize: z.number().optional(),
  ActiveScriptsScriptPageSize: z.number().optional(),
  AutoexecScript: z.string().optional(),

  // Augmentations Ordering
  OwnedAugmentationsOrder: z.number().optional(),
  PurchaseAugmentationsOrder: z.number().optional(),

  // Go Game
  GoTraditionalStyle: z.boolean().optional(),

  // Tail Window
  TailRenderInterval: z.number().optional(),

  // Steam
  SyncSteamAchievements: z.boolean().optional(),

  // Theme & Styles (complex objects)
  theme: z.unknown().optional(),
  styles: z.unknown().optional(),
  EditorTheme: z.unknown().optional(),
  overview: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    opened: z.boolean().optional(),
  }).optional(),
  KeyBindings: z.unknown().optional(),
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
