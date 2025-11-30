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
  updateFactionStats: (
    name: string,
    updates: Partial<Pick<ParsedSaveData['FactionsSave'][string], 'playerReputation' | 'favor' | 'discovery' | 'isBanned'>>
  ) => void;
  setFactionMembership: (name: string, isMember: boolean) => void;
  setFactionInvitation: (name: string, invited: boolean) => void;
  resetFaction: (name: string) => void;
  resetFactions: () => void;
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
  hasFactionChanges: () => boolean;
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

const cloneSave = <T>(data: T): T => structuredClone(data);

const insertAtIndex = (list: string[], value: string, index: number) => {
  const next = [...list];
  if (index >= 0 && index <= next.length) {
    next.splice(index, 0, value);
  } else {
    next.push(value);
  }
  return next;
};

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

  updateFactionStats(name, updates) {
    get().mutateCurrentSave((draft) => {
      const existing = draft.FactionsSave[name] ?? { discovery: 'known' };
      draft.FactionsSave[name] = { ...existing, ...updates };
    });
  },

  setFactionMembership(name, isMember) {
    const originalMembers = get().originalSave?.PlayerSave.data.factions ?? [];
    get().mutateCurrentSave((draft) => {
      const currentMembers = draft.PlayerSave.data.factions || [];
      const isAlreadyMember = currentMembers.includes(name);

      let nextMembers = currentMembers.filter((f) => f !== name);
      if (isMember && !isAlreadyMember) {
        const originalIndex = originalMembers.indexOf(name);
        nextMembers = insertAtIndex(nextMembers, name, originalIndex);
      } else if (isAlreadyMember && !isMember) {
        // already removed by filter
      } else if (isAlreadyMember && isMember) {
        nextMembers = currentMembers;
      }

      draft.PlayerSave.data.factions = nextMembers;

      // Joining clears any pending invitation for the faction
      const currentInvites = draft.PlayerSave.data.factionInvitations || [];
      draft.PlayerSave.data.factionInvitations = isMember
        ? currentInvites.filter((f) => f !== name)
        : currentInvites;

      const faction = draft.FactionsSave[name] ?? { discovery: 'known' };
      faction.isMember = isMember;
      if (isMember) {
        faction.alreadyInvited = false;
      }
      draft.FactionsSave[name] = faction;
    });
  },

  setFactionInvitation(name, invited) {
    const originalInvites = get().originalSave?.PlayerSave.data.factionInvitations ?? [];
    get().mutateCurrentSave((draft) => {
      const currentInvites = draft.PlayerSave.data.factionInvitations || [];
      const isInvited = currentInvites.includes(name);
      const isMember = draft.PlayerSave.data.factions.includes(name);

      const shouldInvite = invited && !isMember;
      let nextInvites = currentInvites.filter((f) => f !== name);

      if (shouldInvite && !isInvited) {
        const originalIndex = originalInvites.indexOf(name);
        nextInvites = insertAtIndex(nextInvites, name, originalIndex);
      } else if (shouldInvite && isInvited) {
        nextInvites = currentInvites;
      }

      draft.PlayerSave.data.factionInvitations = nextInvites;

      const faction = draft.FactionsSave[name] ?? { discovery: 'known' };
      faction.alreadyInvited = shouldInvite;
      draft.FactionsSave[name] = faction;
    });
  },

  resetFaction(name) {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);

    if (Object.prototype.hasOwnProperty.call(originalSave.FactionsSave, name)) {
      draft.FactionsSave[name] = cloneSave(originalSave.FactionsSave[name]);
    } else {
      delete draft.FactionsSave[name];
    }

    const originalMembers = originalSave.PlayerSave.data.factions || [];
    const originalInvites = originalSave.PlayerSave.data.factionInvitations || [];

    draft.PlayerSave.data.factions = draft.PlayerSave.data.factions.filter((f) => f !== name);
    if (originalMembers.includes(name)) {
      const originalIndex = originalMembers.indexOf(name);
      draft.PlayerSave.data.factions = insertAtIndex(draft.PlayerSave.data.factions, name, originalIndex);
    }

    draft.PlayerSave.data.factionInvitations = draft.PlayerSave.data.factionInvitations.filter((f) => f !== name);
    if (originalInvites.includes(name)) {
      const originalIndex = originalInvites.indexOf(name);
      draft.PlayerSave.data.factionInvitations = insertAtIndex(
        draft.PlayerSave.data.factionInvitations,
        name,
        originalIndex
      );
    }

    set({ currentSave: draft });
  },

  resetFactions() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.FactionsSave = cloneSave(originalSave.FactionsSave);
    draft.PlayerSave.data.factions = cloneSave(originalSave.PlayerSave.data.factions);
    draft.PlayerSave.data.factionInvitations = cloneSave(originalSave.PlayerSave.data.factionInvitations);

    set({ currentSave: draft });
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

  hasFactionChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      factions: save.PlayerSave.data.factions,
      factionInvitations: save.PlayerSave.data.factionInvitations,
      factionsSave: save.FactionsSave,
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
