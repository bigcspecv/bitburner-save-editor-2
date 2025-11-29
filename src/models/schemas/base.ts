import { z } from 'zod';

/**
 * Base schema for Bitburner save file structure.
 * The main save object contains a `data` field where each value is a stringified JSON.
 */

// Save data keys enum
export const SaveDataKeySchema = z.enum([
  'PlayerSave',
  'FactionsSave',
  'AllServersSave',
  'CompaniesSave',
  'AliasesSave',
  'GlobalAliasesSave',
  'StockMarketSave',
  'SettingsSave',
  'VersionSave',
  'AllGangsSave',
  'LastExportBonus',
  'StaneksGiftSave',
  'GoSave',
  'InfiltrationsSave',
]);

export type SaveDataKey = z.infer<typeof SaveDataKeySchema>;

/**
 * Base schema for the top-level BitburnerSaveObject.
 * In the actual save file, each value in `data` is a stringified JSON string.
 */
export const BitburnerSaveObjectSchema = z.object({
  ctor: z.literal('BitburnerSaveObject'),
  data: z.record(z.string(), z.string()), // Keys are save sections, values are stringified JSON
});

export type BitburnerSaveObject = z.infer<typeof BitburnerSaveObjectSchema>;

/**
 * Helper to create a schema for objects with a ctor field.
 * Many Bitburner objects follow the pattern: { ctor: string, data: object }
 */
export function createCtorSchema<T extends z.ZodTypeAny>(
  ctorName: string,
  dataSchema: T
) {
  return z.object({
    ctor: z.literal(ctorName),
    data: dataSchema,
  });
}

/**
 * JSONMap schema - Bitburner uses this for Map serialization
 * Format: { ctor: "JSONMap", data: [[key, value], [key, value], ...] }
 */
export function createJSONMapSchema<K extends z.ZodTypeAny, V extends z.ZodTypeAny>(
  keySchema: K,
  valueSchema: V
) {
  return z.object({
    ctor: z.literal('JSONMap'),
    data: z.array(z.tuple([keySchema, valueSchema])),
  });
}

/**
 * JSONSet schema - Bitburner uses this for Set serialization
 * Format: { ctor: "JSONSet", data: [item, item, ...] }
 */
export function createJSONSetSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    ctor: z.literal('JSONSet'),
    data: z.array(itemSchema),
  });
}
