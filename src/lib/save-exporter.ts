import pako from 'pako';
import { serializeSaveData, type ParsedSaveData } from '../models/schemas';

/**
 * Export format options for save files
 */
export type ExportFormat = 'json' | 'json-gz';

/**
 * Export a parsed save file back to a downloadable format
 */
export function exportSaveFile(
  parsedData: ParsedSaveData,
  format: ExportFormat = 'json'
): Blob {
  // Convert parsed data back to BitburnerSaveObject format
  const rawSave = serializeSaveData(parsedData);

  // Convert to JSON string
  const jsonString = JSON.stringify(rawSave);

  if (format === 'json-gz') {
    // Compress with gzip
    const compressed = pako.gzip(jsonString);
    return new Blob([compressed], { type: 'application/gzip' });
  } else {
    // Return as plain JSON
    return new Blob([jsonString], { type: 'application/json' });
  }
}

/**
 * Trigger a browser download of the save file
 */
export function downloadSaveFile(
  parsedData: ParsedSaveData,
  fileName: string = 'bitburnerSave',
  format: ExportFormat = 'json'
): void {
  const blob = exportSaveFile(parsedData, format);

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
