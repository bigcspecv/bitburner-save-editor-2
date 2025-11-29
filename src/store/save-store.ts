import { create } from 'zustand';
import { detectSaveFormat, loadAndParseSaveFile } from '../lib/save-loader';
import type { ParsedSaveData, SaveFormat } from '../models/types';

type SaveStatus = 'idle' | 'loading' | 'ready' | 'error';

interface SaveStoreState {
  originalSave: ParsedSaveData | null;
  currentSave: ParsedSaveData | null;
  saveFormat: SaveFormat | null;
  lastFileName: string | null;
  status: SaveStatus;
  error: string | null;

  loadFromFile: (file: File) => Promise<void>;
  resetToOriginal: () => void;
  replaceCurrentSave: (nextSave: ParsedSaveData) => void;
  mutateCurrentSave: (mutator: (draft: ParsedSaveData) => void) => void;
  hasChanges: () => boolean;
  clearError: () => void;
}

/**
 * Deep freezes an object to keep the original save immutable.
 */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      // @ts-expect-error - accessing arbitrary nested keys
      const child = value[key];
      if (child && typeof child === 'object') {
        deepFreeze(child);
      }
    }
  }
  return value;
}

const cloneSave = (data: ParsedSaveData): ParsedSaveData => structuredClone(data);

async function determineFormat(file: File): Promise<SaveFormat> {
  if (file.name.endsWith('.gz')) {
    return 'gzipped';
  }

  const contents = await file.text();
  return detectSaveFormat(file.name, contents);
}

export const useSaveStore = create<SaveStoreState>((set, get) => ({
  originalSave: null,
  currentSave: null,
  saveFormat: null,
  lastFileName: null,
  status: 'idle',
  error: null,

  async loadFromFile(file) {
    set({ status: 'loading', error: null });

    try {
      const [format, parsed] = await Promise.all([
        determineFormat(file),
        loadAndParseSaveFile(file),
      ]);

      const immutableOriginal = deepFreeze(cloneSave(parsed));
      const editableCopy = cloneSave(parsed);

      set({
        originalSave: immutableOriginal,
        currentSave: editableCopy,
        saveFormat: format,
        lastFileName: file.name,
        status: 'ready',
        error: null,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  resetToOriginal() {
    const { originalSave } = get();
    if (!originalSave) return;

    set({ currentSave: cloneSave(originalSave) });
  },

  replaceCurrentSave(nextSave) {
    set({ currentSave: cloneSave(nextSave) });
  },

  mutateCurrentSave(mutator) {
    const { currentSave } = get();
    if (!currentSave) return;

    const draft = cloneSave(currentSave);
    mutator(draft);
    set({ currentSave: draft });
  },

  hasChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    return JSON.stringify(originalSave) !== JSON.stringify(currentSave);
  },

  clearError() {
    set({ error: null });
  },
}));
