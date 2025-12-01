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
  updateCompanyStats: (
    name: string,
    updates: Partial<Pick<ParsedSaveData['CompaniesSave'][string], 'playerReputation' | 'favor'>>
  ) => void;
  setCurrentJob: (companyName: string, jobTitle: string | null) => void;
  resetCompany: (name: string) => void;
  resetCompanies: () => void;
  updateServerStats: (
    hostname: string,
    updates: Partial<Pick<ParsedSaveData['AllServersSave'][string]['data'],
      'maxRam' | 'cpuCores' | 'moneyAvailable' | 'moneyMax' | 'hackDifficulty' | 'minDifficulty' | 'baseDifficulty' |
      'serverGrowth' | 'requiredHackingSkill' | 'numOpenPortsRequired' | 'backdoorInstalled' |
      'hasAdminRights' | 'ftpPortOpen' | 'httpPortOpen' | 'smtpPortOpen' | 'sqlPortOpen' | 'sshPortOpen'>>
  ) => void;
  resetServer: (hostname: string) => void;
  resetAllServers: () => void;
  resetHomeServer: () => void;
  resetNetworkServers: () => void;
  resetPurchasedServers: () => void;
  addPurchasedServer: (hostname: string, ram: number, cores: number) => void;
  removePurchasedServer: (hostname: string) => void;
  hasChanges: () => boolean;
  hasPlayerStatChanges: () => boolean;
  hasPlayerResourceChanges: () => boolean;
  hasAugmentationChanges: () => boolean;
  hasOtherAugmentationChanges: () => boolean;
  hasFactionChanges: () => boolean;
  hasCompanyChanges: () => boolean;
  hasServerChanges: () => boolean;
  hasHomeServerChanges: () => boolean;
  hasNetworkServerChanges: () => boolean;
  hasPurchasedServerChanges: () => boolean;
  updateGangStats: (
    updates: Partial<Pick<NonNullable<ParsedSaveData['PlayerSave']['data']['gang']>['data'],
      'wanted' | 'respect' | 'territoryClashChance' | 'territoryWarfareEngaged' | 'notifyMemberDeath'>>
  ) => void;
  resetGang: () => void;
  hasGangChanges: () => boolean;
  updateHacknetNode: (
    index: number,
    updates: Partial<Pick<NonNullable<ParsedSaveData['PlayerSave']['data']['hacknetNodes'][number]>['data'],
      'level' | 'ram' | 'cores' | 'totalMoneyGenerated' | 'onlineTimeSeconds'>>
  ) => void;
  addHacknetNode: (name: string, level?: number, ram?: number, cores?: number) => void;
  removeHacknetNode: (index: number) => void;
  resetHacknetNodes: () => void;
  hasHacknetNodeChanges: () => boolean;
  // Source Files & BitNode methods
  updateSourceFileLevel: (bitNodeNumber: number, level: number) => void;
  addSourceFile: (bitNodeNumber: number, level?: number) => void;
  removeSourceFile: (bitNodeNumber: number) => void;
  updateBitNodeN: (bitNodeNumber: number) => void;
  resetSourceFiles: () => void;
  hasSourceFileChanges: () => boolean;
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

  updateCompanyStats(name, updates) {
    get().mutateCurrentSave((draft) => {
      const existing = draft.CompaniesSave[name] ?? { playerReputation: 0, favor: 0 };
      draft.CompaniesSave[name] = { ...existing, ...updates };
    });
  },

  setCurrentJob(companyName, jobTitle) {
    get().mutateCurrentSave((draft) => {
      if (jobTitle === null) {
        // Remove job
        delete draft.PlayerSave.data.jobs[companyName];
      } else {
        // Set or update job
        draft.PlayerSave.data.jobs[companyName] = jobTitle;
      }
    });
  },

  resetCompany(name) {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);

    // Reset company reputation/favor
    if (Object.prototype.hasOwnProperty.call(originalSave.CompaniesSave, name)) {
      draft.CompaniesSave[name] = cloneSave(originalSave.CompaniesSave[name]);
    } else {
      delete draft.CompaniesSave[name];
    }

    // Reset job for this company
    const originalJob = originalSave.PlayerSave.data.jobs[name];
    if (originalJob) {
      draft.PlayerSave.data.jobs[name] = originalJob;
    } else {
      delete draft.PlayerSave.data.jobs[name];
    }

    set({ currentSave: draft });
  },

  resetCompanies() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.CompaniesSave = cloneSave(originalSave.CompaniesSave);
    draft.PlayerSave.data.jobs = cloneSave(originalSave.PlayerSave.data.jobs);

    set({ currentSave: draft });
  },

  hasCompanyChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      companies: save.CompaniesSave,
      jobs: save.PlayerSave.data.jobs,
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
  },

  updateServerStats(hostname, updates) {
    get().mutateCurrentSave((draft) => {
      const server = draft.AllServersSave[hostname];
      if (server) {
        server.data = { ...server.data, ...updates };
      }
    });
  },

  resetServer(hostname) {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);

    // Reset server data
    if (Object.prototype.hasOwnProperty.call(originalSave.AllServersSave, hostname)) {
      draft.AllServersSave[hostname] = cloneSave(originalSave.AllServersSave[hostname]);
    }

    // Also restore cross-reference in purchased servers list if applicable
    const wasPurchased = originalSave.PlayerSave.data.purchasedServers?.includes(hostname) ?? false;
    const isPurchased = draft.PlayerSave.data.purchasedServers?.includes(hostname) ?? false;

    if (wasPurchased && !isPurchased) {
      // Re-add at original index
      const originalIndex = originalSave.PlayerSave.data.purchasedServers.indexOf(hostname);
      draft.PlayerSave.data.purchasedServers = insertAtIndex(
        draft.PlayerSave.data.purchasedServers,
        hostname,
        originalIndex
      );
    } else if (!wasPurchased && isPurchased) {
      // Remove
      draft.PlayerSave.data.purchasedServers = draft.PlayerSave.data.purchasedServers.filter(
        (h) => h !== hostname
      );
    }

    set({ currentSave: draft });
  },

  resetAllServers() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.AllServersSave = cloneSave(originalSave.AllServersSave);
    draft.PlayerSave.data.purchasedServers = cloneSave(originalSave.PlayerSave.data.purchasedServers);

    set({ currentSave: draft });
  },

  hasServerChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      servers: save.AllServersSave,
      purchasedServers: save.PlayerSave.data.purchasedServers,
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
  },

  hasHomeServerChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const snapshot = (save: ParsedSaveData) => ({
      maxRam: save.AllServersSave['home']?.data.maxRam,
      cpuCores: save.AllServersSave['home']?.data.cpuCores,
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
  },

  resetHomeServer() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    const origHome = originalSave.AllServersSave['home'];
    if (origHome && draft.AllServersSave['home']) {
      draft.AllServersSave['home'].data.maxRam = origHome.data.maxRam;
      draft.AllServersSave['home'].data.cpuCores = origHome.data.cpuCores;
    }

    set({ currentSave: draft });
  },

  hasNetworkServerChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    // Get list of network servers (not home, not purchased)
    const purchasedServers = new Set(currentSave.PlayerSave.data.purchasedServers);

    const getNetworkServers = (save: ParsedSaveData) => {
      const result: Record<string, unknown> = {};
      for (const [hostname, server] of Object.entries(save.AllServersSave)) {
        if (hostname !== 'home' && !purchasedServers.has(hostname)) {
          result[hostname] = server;
        }
      }
      return result;
    };

    return JSON.stringify(getNetworkServers(originalSave)) !== JSON.stringify(getNetworkServers(currentSave));
  },

  resetNetworkServers() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    const purchasedServers = new Set(currentSave.PlayerSave.data.purchasedServers);

    // Reset all network servers (not home, not purchased) to original state
    for (const [hostname, origServer] of Object.entries(originalSave.AllServersSave)) {
      if (hostname !== 'home' && !purchasedServers.has(hostname)) {
        draft.AllServersSave[hostname] = structuredClone(origServer);
      }
    }

    set({ currentSave: draft });
  },

  hasPurchasedServerChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const getPurchasedServerSnapshot = (save: ParsedSaveData) => {
      const purchasedList = save.PlayerSave.data.purchasedServers;
      const servers: Record<string, unknown> = {};
      for (const hostname of purchasedList) {
        servers[hostname] = save.AllServersSave[hostname];
      }
      return {
        purchasedServers: purchasedList,
        servers,
        homeServersOnNetwork: save.AllServersSave['home']?.data.serversOnNetwork,
      };
    };

    return JSON.stringify(getPurchasedServerSnapshot(originalSave)) !== JSON.stringify(getPurchasedServerSnapshot(currentSave));
  },

  resetPurchasedServers() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    const originalPurchasedSet = new Set(originalSave.PlayerSave.data.purchasedServers);

    // Rebuild AllServersSave with original key ordering to ensure JSON.stringify consistency
    const originalKeyOrder = Object.keys(originalSave.AllServersSave);
    const newAllServersSave: typeof draft.AllServersSave = {};

    for (const hostname of originalKeyOrder) {
      if (originalPurchasedSet.has(hostname)) {
        // Purchased server - restore from original
        newAllServersSave[hostname] = structuredClone(originalSave.AllServersSave[hostname]);
      } else {
        // Not a purchased server - keep current state (or original if missing)
        newAllServersSave[hostname] = draft.AllServersSave[hostname] ?? structuredClone(originalSave.AllServersSave[hostname]);
      }
    }

    draft.AllServersSave = newAllServersSave;

    // Restore the purchasedServers list
    draft.PlayerSave.data.purchasedServers = structuredClone(originalSave.PlayerSave.data.purchasedServers);

    // Restore home server's serversOnNetwork array
    if (originalSave.AllServersSave['home'] && draft.AllServersSave['home']) {
      draft.AllServersSave['home'].data.serversOnNetwork = structuredClone(
        originalSave.AllServersSave['home'].data.serversOnNetwork
      );
    }

    set({ currentSave: draft });
  },

  addPurchasedServer(hostname, ram, cores) {
    get().mutateCurrentSave((draft) => {
      // Generate a unique random IP address using Bitburner's algorithm
      // Source: .bitburner-src-dev/src/utils/IPAddress.ts
      const existingIPs = Object.values(draft.AllServersSave).map((s) => s.data.ip);
      let newIP = '';
      let attempts = 0;
      const maxAttempts = 1000;

      // Keep generating random IPs until we find a unique one
      while (attempts < maxAttempts) {
        // Credit goes to yichizhng on BitBurner discord
        // Generates a number like 0.c8f0a07f1d47e8
        const ip = Math.random().toString(16);
        // uses regex to match every 2 characters. [0.][c8][f0][a0][7f][1d][47][e8]
        // we only want #1 through #4
        const matchResult = ip.match(/../g);
        if (!matchResult) {
          attempts++;
          continue;
        }
        const sliced = matchResult.slice(1, 5);
        // convert each to a decimal number and join them together to make a human readable IP address.
        const testIP = sliced.map((x) => parseInt(x, 16)).join('.');

        if (!existingIPs.includes(testIP)) {
          newIP = testIP;
          break;
        }
        attempts++;
      }

      // Fallback - this should rarely/never happen
      if (!newIP) {
        newIP = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
      }

      // Create the new server
      const newServer = {
        ctor: 'Server' as const,
        data: {
          hostname,
          ip: newIP,
          organizationName: '',
          isConnectedTo: false,
          hasAdminRights: true,
          maxRam: ram,
          ftpPortOpen: true,
          httpPortOpen: true,
          smtpPortOpen: true,
          sqlPortOpen: true,
          sshPortOpen: true,
          cpuCores: cores,
          scripts: {
            ctor: 'JSONMap' as const,
            data: [] as [string, { ctor: string; data: { filename: string; code: string; server: string } }][],
          },
          messages: [],
          programs: [],
          contracts: [],
          purchasedByPlayer: true,
          serversOnNetwork: ['home'], // Connect to home computer
        },
      };

      // Add to AllServersSave
      draft.AllServersSave[hostname] = newServer;

      // Add to purchasedServers list
      if (!draft.PlayerSave.data.purchasedServers.includes(hostname)) {
        draft.PlayerSave.data.purchasedServers.push(hostname);
      }

      // Add this server to home's network
      const homeServer = draft.AllServersSave['home'];
      if (homeServer && homeServer.data.serversOnNetwork) {
        if (!homeServer.data.serversOnNetwork.includes(hostname)) {
          homeServer.data.serversOnNetwork.push(hostname);
        }
      }
    });
  },

  removePurchasedServer(hostname) {
    get().mutateCurrentSave((draft) => {
      // Remove from AllServersSave
      delete draft.AllServersSave[hostname];

      // Remove from purchasedServers list
      draft.PlayerSave.data.purchasedServers = draft.PlayerSave.data.purchasedServers.filter(
        (h) => h !== hostname
      );

      // Remove from home's network
      const homeServer = draft.AllServersSave['home'];
      if (homeServer && homeServer.data.serversOnNetwork) {
        homeServer.data.serversOnNetwork = homeServer.data.serversOnNetwork.filter(
          (h) => h !== hostname
        );
      }
    });
  },

  hasChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    return JSON.stringify(originalSave) !== JSON.stringify(currentSave);
  },

  updateGangStats(updates) {
    get().mutateCurrentSave((draft) => {
      if (draft.PlayerSave.data.gang) {
        draft.PlayerSave.data.gang.data = {
          ...draft.PlayerSave.data.gang.data,
          ...updates,
        };
      }
    });
  },

  resetGang() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave.data.gang = cloneSave(originalSave.PlayerSave.data.gang);
    draft.AllGangsSave = cloneSave(originalSave.AllGangsSave);

    // Also reset the gang's faction reputation/favor
    const gangFacName = originalSave.PlayerSave.data.gang?.data.facName;
    if (gangFacName && originalSave.FactionsSave[gangFacName]) {
      draft.FactionsSave[gangFacName] = cloneSave(originalSave.FactionsSave[gangFacName]);
    }

    set({ currentSave: draft });
  },

  hasGangChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const gangFacName = originalSave.PlayerSave.data.gang?.data.facName;

    const snapshot = (save: ParsedSaveData) => ({
      gang: save.PlayerSave.data.gang,
      allGangs: save.AllGangsSave,
      // Include the gang faction's data in change detection
      gangFaction: gangFacName ? save.FactionsSave[gangFacName] : null,
    });

    return JSON.stringify(snapshot(originalSave)) !== JSON.stringify(snapshot(currentSave));
  },

  updateHacknetNode(index, updates) {
    get().mutateCurrentSave((draft) => {
      const node = draft.PlayerSave.data.hacknetNodes[index];
      if (node) {
        node.data = { ...node.data, ...updates };
      }
    });
  },

  addHacknetNode(name, level = 1, ram = 1, cores = 1) {
    get().mutateCurrentSave((draft) => {
      const newNode = {
        ctor: 'HacknetNode' as const,
        data: {
          name,
          level,
          ram,
          cores,
          totalMoneyGenerated: 0,
          onlineTimeSeconds: 0,
          moneyGainRatePerSecond: 0,
        },
      };
      draft.PlayerSave.data.hacknetNodes.push(newNode);
    });
  },

  removeHacknetNode(index) {
    get().mutateCurrentSave((draft) => {
      draft.PlayerSave.data.hacknetNodes.splice(index, 1);
    });
  },

  resetHacknetNodes() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave.data.hacknetNodes = cloneSave(originalSave.PlayerSave.data.hacknetNodes);
    set({ currentSave: draft });
  },

  hasHacknetNodeChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    return JSON.stringify(originalSave.PlayerSave.data.hacknetNodes) !==
      JSON.stringify(currentSave.PlayerSave.data.hacknetNodes);
  },

  // Source Files & BitNode methods
  updateSourceFileLevel(bitNodeNumber, level) {
    get().mutateCurrentSave((draft) => {
      const sourceFiles = draft.PlayerSave.data.sourceFiles;
      const existingIndex = sourceFiles.data.findIndex(([bn]) => bn === bitNodeNumber);
      if (existingIndex !== -1) {
        sourceFiles.data[existingIndex] = [bitNodeNumber, level];
      }
    });
  },

  addSourceFile(bitNodeNumber, level = 1) {
    get().mutateCurrentSave((draft) => {
      const sourceFiles = draft.PlayerSave.data.sourceFiles;
      const existingIndex = sourceFiles.data.findIndex(([bn]) => bn === bitNodeNumber);
      if (existingIndex === -1) {
        // Insert in sorted order by BitNode number
        const insertIndex = sourceFiles.data.findIndex(([bn]) => bn > bitNodeNumber);
        if (insertIndex === -1) {
          sourceFiles.data.push([bitNodeNumber, level]);
        } else {
          sourceFiles.data.splice(insertIndex, 0, [bitNodeNumber, level]);
        }

        // SF9 changes Hacknet from Nodes to Servers - the data structures are incompatible.
        // When SF9 is added, we must clear hacknetNodes because HacknetNode objects
        // are not valid when hasHacknetServers() returns true.
        // The game will let the player purchase new Hacknet Servers.
        if (bitNodeNumber === 9) {
          draft.PlayerSave.data.hacknetNodes = [];
          // Reset hash manager since there are no servers
          draft.PlayerSave.data.hashManager.data.hashes = 0;
          draft.PlayerSave.data.hashManager.data.capacity = 0;
        }
      }
    });
  },

  removeSourceFile(bitNodeNumber) {
    get().mutateCurrentSave((draft) => {
      const sourceFiles = draft.PlayerSave.data.sourceFiles;
      const existingIndex = sourceFiles.data.findIndex(([bn]) => bn === bitNodeNumber);
      if (existingIndex !== -1) {
        sourceFiles.data.splice(existingIndex, 1);

        // SF9 changes Hacknet from Nodes to Servers - the data structures are incompatible.
        // When SF9 is removed (and player is not in BN9), hacknetNodes would contain
        // hostname strings instead of HacknetNode objects, which causes errors.
        // Clear the array so the player can purchase new Hacknet Nodes.
        if (bitNodeNumber === 9 && draft.PlayerSave.data.bitNodeN !== 9) {
          draft.PlayerSave.data.hacknetNodes = [];
        }
      }
    });
  },

  updateBitNodeN(bitNodeNumber) {
    get().mutateCurrentSave((draft) => {
      const previousBitNode = draft.PlayerSave.data.bitNodeN;
      draft.PlayerSave.data.bitNodeN = bitNodeNumber;

      // Check if SF9 access changed due to BitNode change
      // canAccessBitNodeFeature(9) = Player.bitNodeN === 9 || Player.activeSourceFileLvl(9) > 0
      const hasSF9 = draft.PlayerSave.data.sourceFiles.data.some(([bn]) => bn === 9);
      const wasInBN9 = previousBitNode === 9;
      const isInBN9 = bitNodeNumber === 9;

      // If entering BN9 without SF9, clear hacknetNodes (HacknetNode -> HacknetServer)
      if (!wasInBN9 && isInBN9 && !hasSF9) {
        draft.PlayerSave.data.hacknetNodes = [];
        draft.PlayerSave.data.hashManager.data.hashes = 0;
        draft.PlayerSave.data.hashManager.data.capacity = 0;
      }
      // If leaving BN9 without SF9, hacknetNodes should stay empty or be cleared
      // (would contain hostnames from HacknetServers which aren't valid HacknetNodes)
      else if (wasInBN9 && !isInBN9 && !hasSF9) {
        draft.PlayerSave.data.hacknetNodes = [];
      }
    });
  },

  resetSourceFiles() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return;

    const draft = cloneSave(currentSave);
    draft.PlayerSave.data.sourceFiles = cloneSave(originalSave.PlayerSave.data.sourceFiles);
    draft.PlayerSave.data.bitNodeN = originalSave.PlayerSave.data.bitNodeN;
    set({ currentSave: draft });
  },

  hasSourceFileChanges() {
    const { originalSave, currentSave } = get();
    if (!originalSave || !currentSave) return false;

    const sfChanged = JSON.stringify(originalSave.PlayerSave.data.sourceFiles) !==
      JSON.stringify(currentSave.PlayerSave.data.sourceFiles);
    const bnChanged = originalSave.PlayerSave.data.bitNodeN !== currentSave.PlayerSave.data.bitNodeN;

    return sfChanged || bnChanged;
  },

  clearError() {
    set({ error: null });
  },
}));
