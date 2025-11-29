import { create } from 'zustand';
import { detectSaveFormat, loadAndParseSaveFile, loadSaveFile } from '../lib/save-loader';
import type { ParsedSaveData, SaveFormat } from '../models/types';
import type { BitburnerSaveObject } from '../models/schemas';

type SaveStatus = 'idle' | 'loading' | 'ready' | 'error';

interface SaveStoreState {
  originalSave: ParsedSaveData | null;
  currentSave: ParsedSaveData | null;
  originalRawData: BitburnerSaveObject['data'] | null;
  saveFormat: SaveFormat | null;
  lastFileName: string | null;
  status: SaveStatus;
  error: string | null;

  loadFromFile: (file: File) => Promise<void>;
  resetToOriginal: () => void;
  replaceCurrentSave: (nextSave: ParsedSaveData) => void;
  mutateCurrentSave: (mutator: (draft: ParsedSaveData) => void) => void;
  updatePlayerExp: (skill: keyof ParsedSaveData['PlayerSave']['data']['exp'], value: number) => void;
  updatePlayerHp: (field: keyof ParsedSaveData['PlayerSave']['data']['hp'], value: number) => void;
  updatePlayerResources: (updates: Partial<Pick<ParsedSaveData['PlayerSave']['data'], 'money' | 'karma' | 'entropy'>>) => void;
  resetPlayer: () => void;
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
  originalRawData: null,
  saveFormat: null,
  lastFileName: null,
  status: 'idle',
  error: null,

  async loadFromFile(file) {
    set({ status: 'loading', error: null });

    try {
      const [format, rawSave, parsed] = await Promise.all([
        determineFormat(file),
        loadSaveFile(file),
        loadAndParseSaveFile(file),
      ]);

      const immutableOriginal = deepFreeze(cloneSave(parsed));
      const editableCopy = cloneSave(parsed);

      set({
        originalSave: immutableOriginal,
        currentSave: editableCopy,
        originalRawData: rawSave.data,
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

  updatePlayerExp(skill, value) {
    get().mutateCurrentSave((draft) => {
      draft.PlayerSave.data.exp[skill] = value;
    });
  },

  updatePlayerHp(field, value) {
    get().mutateCurrentSave((draft) => {
      if (field === 'current') {
        draft.PlayerSave.data.hp.current = value;
        if (value > draft.PlayerSave.data.hp.max) {
          draft.PlayerSave.data.hp.max = value;
        }
      } else {
        draft.PlayerSave.data.hp[field] = value;
      }
    });
  },

  updatePlayerResources(updates) {
    get().mutateCurrentSave((draft) => {
      draft.PlayerSave.data = {
        ...draft.PlayerSave.data,
        ...updates,
      };
    });
  },

  resetPlayer() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave = cloneSave(originalSave.PlayerSave);
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
