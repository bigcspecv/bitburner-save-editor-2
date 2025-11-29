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
  addAugmentation: (name: string, level: number, queued: boolean) => void;
  removeAugmentation: (name: string, queued: boolean) => void;
  updateAugmentationLevel: (name: string, level: number, queued: boolean) => void;
  resetAugmentations: () => void;
  resetOtherAugmentations: () => void;
  resetPlayerStats: () => void;
  resetPlayerResources: () => void;
  resetPlayer: () => void;
  hasChanges: () => boolean;
  hasPlayerStatChanges: () => boolean;
  hasPlayerResourceChanges: () => boolean;
  hasAugmentationChanges: () => boolean;
  hasOtherAugmentationChanges: () => boolean;
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

  addAugmentation(name, level, queued) {
    get().mutateCurrentSave((draft) => {
      const targetArray = queued
        ? draft.PlayerSave.data.queuedAugmentations
        : draft.PlayerSave.data.augmentations;

      // Check if augmentation already exists
      const existing = targetArray.find(aug => aug.name === name);
      if (existing) {
        existing.level = level;
      } else {
        targetArray.push({ name, level });
      }
    });
  },

  removeAugmentation(name, queued) {
    get().mutateCurrentSave((draft) => {
      const targetArray = queued
        ? draft.PlayerSave.data.queuedAugmentations
        : draft.PlayerSave.data.augmentations;

      const index = targetArray.findIndex(aug => aug.name === name);
      if (index !== -1) {
        targetArray.splice(index, 1);
      }
    });
  },

  updateAugmentationLevel(name, level, queued) {
    get().mutateCurrentSave((draft) => {
      const targetArray = queued
        ? draft.PlayerSave.data.queuedAugmentations
        : draft.PlayerSave.data.augmentations;

      const aug = targetArray.find(aug => aug.name === name);
      if (aug) {
        aug.level = level;
      }
    });
  },

  resetAugmentations() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave.data.augmentations = structuredClone(originalSave.PlayerSave.data.augmentations);
    draft.PlayerSave.data.queuedAugmentations = structuredClone(originalSave.PlayerSave.data.queuedAugmentations);
    set({ currentSave: draft });
  },

  resetOtherAugmentations() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);

    // Keep current NeuroFlux, restore everything else from original
    const currentNeuroInstalled = draft.PlayerSave.data.augmentations.filter(a => a.name === 'NeuroFlux Governor');
    const currentNeuroQueued = draft.PlayerSave.data.queuedAugmentations.filter(a => a.name === 'NeuroFlux Governor');

    const originalNonNeuroInstalled = originalSave.PlayerSave.data.augmentations.filter(a => a.name !== 'NeuroFlux Governor');
    const originalNonNeuroQueued = originalSave.PlayerSave.data.queuedAugmentations.filter(a => a.name !== 'NeuroFlux Governor');

    draft.PlayerSave.data.augmentations = [...structuredClone(originalNonNeuroInstalled), ...currentNeuroInstalled];
    draft.PlayerSave.data.queuedAugmentations = [...structuredClone(originalNonNeuroQueued), ...currentNeuroQueued];

    set({ currentSave: draft });
  },

  hasAugmentationChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      augmentations: save.PlayerSave.data.augmentations,
      queuedAugmentations: save.PlayerSave.data.queuedAugmentations,
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
  },

  hasOtherAugmentationChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      augmentations: save.PlayerSave.data.augmentations.filter(a => a.name !== 'NeuroFlux Governor'),
      queuedAugmentations: save.PlayerSave.data.queuedAugmentations.filter(a => a.name !== 'NeuroFlux Governor'),
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
  },

  resetPlayerStats() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave.data = {
      ...draft.PlayerSave.data,
      hp: cloneSave(originalSave.PlayerSave.data.hp),
      skills: cloneSave(originalSave.PlayerSave.data.skills),
      exp: cloneSave(originalSave.PlayerSave.data.exp),
      mults: cloneSave(originalSave.PlayerSave.data.mults),
    };

    set({ currentSave: draft });
  },

  resetPlayer() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave = cloneSave(originalSave.PlayerSave);
    set({ currentSave: draft });
  },

  resetPlayerResources() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave.data = {
      ...draft.PlayerSave.data,
      money: originalSave.PlayerSave.data.money,
      karma: originalSave.PlayerSave.data.karma,
      entropy: originalSave.PlayerSave.data.entropy,
    };

    set({ currentSave: draft });
  },

  hasPlayerStatChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      hp: save.PlayerSave.data.hp,
      skills: save.PlayerSave.data.skills,
      exp: save.PlayerSave.data.exp,
      mults: save.PlayerSave.data.mults,
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
  },

  hasPlayerResourceChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      money: save.PlayerSave.data.money,
      karma: save.PlayerSave.data.karma,
      entropy: save.PlayerSave.data.entropy,
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
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
