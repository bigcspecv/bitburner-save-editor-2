import pako from 'pako';
import { SaveFormat } from '../models/types';
import {
  validateRawSave,
  parseSaveData,
  type ParsedSaveData,
  type BitburnerSaveObject
} from '../models/schemas';

/**
 * Detect save file format based on content
 */
export function detectSaveFormat(fileName: string, content: string): SaveFormat {
  if (fileName.endsWith('.gz')) {
    return 'gzipped';
  }

  // Try to parse as JSON
  try {
    JSON.parse(content);
    return 'json';
  } catch {
    // If not valid JSON, assume base64
    return 'base64';
  }
}

/**
 * Load and parse a Bitburner save file.
 * Returns the raw save object with stringified JSON values.
 */
export async function loadSaveFile(file: File): Promise<BitburnerSaveObject> {
  let fileText: string;

  // Handle gzipped files
  if (file.name.endsWith('.gz')) {
    const arrayBuffer = await file.arrayBuffer();
    const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
    fileText = decompressed;
  } else {
    fileText = await file.text();
  }

  // Try to parse as JSON first (v2.8.1+ format)
  let rawData: unknown;
  try {
    rawData = JSON.parse(fileText);
  } catch {
    // Fall back to base64 decoding (older format)
    const decoded = atob(fileText);
    rawData = JSON.parse(decoded);
  }

  // Validate the raw save structure using Zod
  try {
    return validateRawSave(rawData);
  } catch (error) {
    throw new Error(`Invalid save file structure: ${error}`);
  }
}

/**
 * Load and fully parse a Bitburner save file.
 * Returns the parsed and validated save data ready for editing.
 */
export async function loadAndParseSaveFile(file: File): Promise<ParsedSaveData> {
  const rawSave = await loadSaveFile(file);

  try {
    return parseSaveData(rawSave);
  } catch (error) {
    throw new Error(`Failed to parse save file contents: ${error}`);
  }
}
