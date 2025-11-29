import pako from 'pako';
import { serializeSaveData, type ParsedSaveData } from '../models/schemas';

type SectionMap = Record<string, unknown>;

/**
 * Export format options for save files
 */
export type ExportFormat = 'json' | 'json-gz' | 'base64';

function encodeBase64(input: string): string {
  // Prefer native Buffer if available (e.g., during SSR), otherwise fall back to browser-safe encoding.
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toString('base64');
  }

  // Browser fallback using TextEncoder + btoa
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  throw new Error('No base64 encoder available in this environment');
}

/**
 * Build a raw save object suitable for serialization, optionally reusing
 * untouched sections from the original raw data to avoid subtle differences.
 */
function buildRawSave(
  parsedData: ParsedSaveData,
  originalParsed?: ParsedSaveData | null,
  originalRawData?: Record<string, string> | null
) {
  // If no original raw is provided, fall back to straight serialization.
  if (!originalRawData) {
    return serializeSaveData(parsedData);
  }

  const data: Record<string, string> = {};

  // Preserve original key order to minimize diffs.
  const keyOrder = Object.keys(originalRawData);

  const pickStringified = (key: string, value: unknown): string => {
    const originalSection = originalParsed ? (originalParsed as SectionMap)[key] : undefined;
    const currentSection = (parsedData as SectionMap)[key];
    const originalString = originalRawData[key];

    // If the section hasn't changed and we have the original string, reuse it verbatim.
    if (
      originalSection !== undefined &&
      currentSection !== undefined &&
      originalString !== undefined &&
      JSON.stringify(currentSection) === JSON.stringify(originalSection)
    ) {
      return originalString;
    }

    // Otherwise, stringify the current section (if present); if not, reuse original or empty string.
    if (currentSection !== undefined) {
      return JSON.stringify(currentSection);
    }

    return originalString ?? '';
  };

  for (const key of keyOrder) {
    data[key] = pickStringified(key, (parsedData as SectionMap)[key]);
  }

  // Include any new sections not present in the original order.
  for (const [key, value] of Object.entries(parsedData)) {
    if (!(key in data) && value !== undefined) {
      data[key] = JSON.stringify(value);
    }
  }

  return {
    ctor: 'BitburnerSaveObject',
    data,
  };
}

/**
 * Export a parsed save file back to a downloadable format
 */
export function exportSaveFile(
  parsedData: ParsedSaveData,
  format: ExportFormat = 'json',
  options?: {
    originalParsed?: ParsedSaveData | null;
    originalRawData?: Record<string, string> | null;
  }
): Blob {
  const rawSave = buildRawSave(parsedData, options?.originalParsed, options?.originalRawData);

  // Convert to JSON string
  const jsonString = JSON.stringify(rawSave);

  if (format === 'json-gz') {
    // Compress with gzip
    const compressed = pako.gzip(jsonString);
    return new Blob([compressed], { type: 'application/gzip' });
  }

  if (format === 'base64') {
    const encoded = encodeBase64(jsonString);
    return new Blob([encoded], { type: 'application/octet-stream' });
  }

  // Default: plain JSON
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Trigger a browser download of the save file
 */
export function downloadSaveFile(
  parsedData: ParsedSaveData,
  fileName: string = 'bitburnerSave',
  format: ExportFormat = 'json',
  options?: {
    originalParsed?: ParsedSaveData | null;
    originalRawData?: Record<string, string> | null;
  }
): void {
  const blob = exportSaveFile(parsedData, format, options);

  // Add appropriate file extension
  const extension = format === 'json-gz' ? '.json.gz' : '.json';
  const fullFileName = fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;

  // Create download link and trigger
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
