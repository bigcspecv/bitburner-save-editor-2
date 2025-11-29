/**
 * Core save file types
 * Re-exports types from Zod schemas for convenience
 */

// Re-export all schema-based types
export * from './schemas';

// Save format type
export type SaveFormat = 'gzipped' | 'base64' | 'json';
