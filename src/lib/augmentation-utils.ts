/**
 * Augmentation filtering and utility functions
 */

import { AugmentationData, AugmentationMultipliers } from "../models/types";
import { ALL_AUGMENTATIONS, AUGMENTATION_DATA } from "../models/data/augmentations";

export type AugmentationStatus = "none" | "queued" | "installed";

export interface AugmentationWithStatus extends AugmentationData {
  key: string;
  status: AugmentationStatus;
  installedLevel?: number;
  queuedLevel?: number;
}

export interface AugmentationFilters {
  search?: string;
  status?: {
    none?: boolean;
    queued?: boolean;
    installed?: boolean;
  };
  effects?: {
    hacking?: boolean;
    strength?: boolean;
    defense?: boolean;
    dexterity?: boolean;
    agility?: boolean;
    charisma?: boolean;
    company_rep?: boolean;
    faction_rep?: boolean;
    crime?: boolean;
    hacknet?: boolean;
    bladeburner?: boolean;
  };
}

/**
 * Get augmentation status from save data
 */
export function getAugmentationStatus(
  augKey: string,
  installedAugs: Array<{ name: string; level: number }>,
  queuedAugs: Array<{ name: string; level: number }>
): { status: AugmentationStatus; installedLevel?: number; queuedLevel?: number } {
  const augData = AUGMENTATION_DATA[augKey];
  if (!augData) {
    return { status: "none" };
  }

  // Check both internal key and display name
  const installedByKey = installedAugs.find((a) => a.name === augKey);
  const installedByName = installedAugs.find((a) => a.name === augData.name);
  const installed = installedByKey || installedByName;

  const queuedByKey = queuedAugs.find((a) => a.name === augKey);
  const queuedByName = queuedAugs.find((a) => a.name === augData.name);
  const queued = queuedByKey || queuedByName;

  if (installed) {
    return {
      status: "installed",
      installedLevel: installed.level,
      queuedLevel: queued?.level,
    };
  }

  if (queued) {
    return {
      status: "queued",
      queuedLevel: queued.level,
    };
  }

  return { status: "none" };
}

/**
 * Build complete augmentation list with status
 */
export function buildAugmentationList(
  installedAugs: Array<{ name: string; level: number }>,
  queuedAugs: Array<{ name: string; level: number }>
): AugmentationWithStatus[] {
  return ALL_AUGMENTATIONS.map((key) => {
    const data = AUGMENTATION_DATA[key];
    const statusInfo = getAugmentationStatus(key, installedAugs, queuedAugs);

    return {
      ...data,
      key,
      status: statusInfo.status,
      installedLevel: statusInfo.installedLevel,
      queuedLevel: statusInfo.queuedLevel,
    };
  });
}

/**
 * Filter augmentations based on search and filters
 */
export function filterAugmentations(
  augmentations: AugmentationWithStatus[],
  filters: AugmentationFilters
): AugmentationWithStatus[] {
  let filtered = [...augmentations];

  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (aug) =>
        aug.name.toLowerCase().includes(searchLower) ||
        aug.info.toLowerCase().includes(searchLower) ||
        aug.factions.some((f) => f.toLowerCase().includes(searchLower))
    );
  }

  // Status filter
  if (filters.status) {
    const { none, queued, installed } = filters.status;
    const anyStatusSelected = none || queued || installed;

    if (anyStatusSelected) {
      filtered = filtered.filter((aug) => {
        if (none && aug.status === "none") return true;
        if (queued && aug.status === "queued") return true;
        if (installed && aug.status === "installed") return true;
        return false;
      });
    }
  }

  // Effect filters
  if (filters.effects) {
    const activeEffects = Object.entries(filters.effects)
      .filter(([_, enabled]) => enabled)
      .map(([effect]) => effect);

    if (activeEffects.length > 0) {
      filtered = filtered.filter((aug) => {
        return activeEffects.some((effect) => {
          switch (effect) {
            case "hacking":
              return hasHackingEffect(aug.multipliers);
            case "strength":
              return aug.multipliers.strength || aug.multipliers.strength_exp;
            case "defense":
              return aug.multipliers.defense || aug.multipliers.defense_exp;
            case "dexterity":
              return aug.multipliers.dexterity || aug.multipliers.dexterity_exp;
            case "agility":
              return aug.multipliers.agility || aug.multipliers.agility_exp;
            case "charisma":
              return aug.multipliers.charisma || aug.multipliers.charisma_exp;
            case "company_rep":
              return aug.multipliers.company_rep;
            case "faction_rep":
              return aug.multipliers.faction_rep;
            case "crime":
              return aug.multipliers.crime_money || aug.multipliers.crime_success;
            case "hacknet":
              return hasHacknetEffect(aug.multipliers);
            case "bladeburner":
              return hasBladeburnerEffect(aug.multipliers);
            default:
              return false;
          }
        });
      });
    }
  }

  return filtered;
}

/**
 * Check if augmentation has hacking-related effects
 */
function hasHackingEffect(mults: AugmentationMultipliers): boolean {
  return !!(
    mults.hacking ||
    mults.hacking_exp ||
    mults.hacking_chance ||
    mults.hacking_speed ||
    mults.hacking_money ||
    mults.hacking_grow
  );
}

/**
 * Check if augmentation has hacknet-related effects
 */
function hasHacknetEffect(mults: AugmentationMultipliers): boolean {
  return !!(
    mults.hacknet_node_money ||
    mults.hacknet_node_purchase_cost ||
    mults.hacknet_node_ram_cost ||
    mults.hacknet_node_core_cost ||
    mults.hacknet_node_level_cost
  );
}

/**
 * Check if augmentation has bladeburner-related effects
 */
function hasBladeburnerEffect(mults: AugmentationMultipliers): boolean {
  return !!(
    mults.bladeburner_max_stamina ||
    mults.bladeburner_stamina_gain ||
    mults.bladeburner_analysis ||
    mults.bladeburner_success_chance
  );
}

/**
 * Check if all prerequisites are met for an augmentation
 */
export function checkPrerequisites(
  augKey: string,
  installedAugs: Array<{ name: string; level: number }>,
  queuedAugs: Array<{ name: string; level: number }>
): {
  allMet: boolean;
  prereqs: Array<{
    key: string;
    name: string;
    installed: boolean;
    queued: boolean;
  }>;
} {
  const augData = AUGMENTATION_DATA[augKey];
  if (!augData || !augData.prereqs || augData.prereqs.length === 0) {
    return { allMet: true, prereqs: [] };
  }

  const prereqStatuses = augData.prereqs.map((prereqKey) => {
    const prereqData = AUGMENTATION_DATA[prereqKey];
    const prereqName = prereqData?.name || prereqKey;

    const installed = installedAugs.some(
      (a) => a.name === prereqKey || a.name === prereqName
    );
    const queued = queuedAugs.some(
      (a) => a.name === prereqKey || a.name === prereqName
    );

    return {
      key: prereqKey,
      name: prereqName,
      installed,
      queued,
    };
  });

  const allMet = prereqStatuses.every((p) => p.installed || p.queued);

  return { allMet, prereqs: prereqStatuses };
}

/**
 * Format multiplier value for display
 */
export function formatMultiplier(value: number, effectKey: string): string {
  // Cost reductions show as negative percentages
  if (effectKey.includes("cost")) {
    const reduction = (1 - value) * 100;
    return reduction > 0
      ? `-${reduction.toFixed(1)}%`
      : `+${Math.abs(reduction).toFixed(1)}%`;
  }

  // All other multipliers show as positive bonuses
  const bonus = (value - 1) * 100;
  return bonus >= 0
    ? `+${bonus.toFixed(1)}%`
    : `${bonus.toFixed(1)}%`;
}

/**
 * Get human-readable effect name
 */
export function getEffectLabel(effectKey: keyof AugmentationMultipliers): string {
  const labels: Record<string, string> = {
    hacking: "Hacking Skill",
    strength: "Strength",
    defense: "Defense",
    dexterity: "Dexterity",
    agility: "Agility",
    charisma: "Charisma",
    hacking_exp: "Hacking EXP",
    strength_exp: "Strength EXP",
    defense_exp: "Defense EXP",
    dexterity_exp: "Dexterity EXP",
    agility_exp: "Agility EXP",
    charisma_exp: "Charisma EXP",
    hacking_chance: "Hack Chance",
    hacking_speed: "Hack Speed",
    hacking_money: "Hack Money",
    hacking_grow: "Hack Grow",
    company_rep: "Company Rep",
    faction_rep: "Faction Rep",
    crime_money: "Crime Money",
    crime_success: "Crime Success",
    work_money: "Work Money",
    hacknet_node_money: "Hacknet Production",
    hacknet_node_purchase_cost: "Hacknet Purchase Cost",
    hacknet_node_ram_cost: "Hacknet RAM Cost",
    hacknet_node_core_cost: "Hacknet Core Cost",
    hacknet_node_level_cost: "Hacknet Level Cost",
    bladeburner_max_stamina: "Bladeburner Max Stamina",
    bladeburner_stamina_gain: "Bladeburner Stamina Gain",
    bladeburner_analysis: "Bladeburner Analysis",
    bladeburner_success_chance: "Bladeburner Success",
  };

  return labels[effectKey] || effectKey;
}
