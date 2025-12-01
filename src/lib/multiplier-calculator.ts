import type { ParsedSaveData } from '../models/types';
import { AUGMENTATION_DATA, ALL_AUGMENTATIONS } from '../models/data/augmentations';
import { nameMatchesAugmentation } from './augmentation-utils';

const EXPLOIT_MULT = 1.001; // see applyExploit

// Unstable Circadian Modulator has 7 possible bonus configurations
// that change hourly based on real time. We need to infer which was active.
const CIRCADIAN_BONUS_SETS = [
  {
    name: 'Hacking Performance',
    bonuses: { hacking_chance: 1.25, hacking_speed: 1.1, hacking_money: 1.25, hacking_grow: 1.1 },
    detectionKey: 'hacking_chance' as const,
    detectionValue: 1.25,
  },
  {
    name: 'Hacking Skill',
    bonuses: { hacking: 1.15, hacking_exp: 2 },
    detectionKey: 'hacking_exp' as const,
    detectionValue: 2,
  },
  {
    name: 'Combat Stats',
    bonuses: {
      strength: 1.25, strength_exp: 2,
      defense: 1.25, defense_exp: 2,
      dexterity: 1.25, dexterity_exp: 2,
      agility: 1.25, agility_exp: 2,
    },
    detectionKey: 'strength_exp' as const,
    detectionValue: 2,
  },
  {
    name: 'Charisma',
    bonuses: { charisma: 1.5, charisma_exp: 2 },
    detectionKey: 'charisma' as const,
    detectionValue: 1.5,
  },
  {
    name: 'Hacknet',
    bonuses: {
      hacknet_node_money: 1.2,
      hacknet_node_purchase_cost: 0.85,
      hacknet_node_ram_cost: 0.85,
      hacknet_node_core_cost: 0.85,
      hacknet_node_level_cost: 0.85,
    },
    detectionKey: 'hacknet_node_purchase_cost' as const,
    detectionValue: 0.85,
  },
  {
    name: 'Work & Reputation',
    bonuses: { company_rep: 1.25, faction_rep: 1.15, work_money: 1.7 },
    detectionKey: 'work_money' as const,
    detectionValue: 1.7,
  },
  {
    name: 'Crime',
    bonuses: { crime_success: 2, crime_money: 2 },
    detectionKey: 'crime_success' as const,
    detectionValue: 2,
  },
];

// Stanek's Gift fragment type enum (from game code)
const FragmentType = {
  HackingSpeed: 3,
  HackingMoney: 4,
  HackingGrow: 5,
  Hacking: 6,
  Strength: 7,
  Defense: 8,
  Dexterity: 9,
  Agility: 10,
  Charisma: 11,
  HacknetMoney: 12,
  HacknetCost: 13,
  Rep: 14,
  WorkMoney: 15,
  Crime: 16,
  Bladeburner: 17,
  Booster: 18,
} as const;

// Fragment data (id -> type, power)
const FRAGMENT_DATA: Record<number, { type: number; power: number }> = {
  0: { type: FragmentType.Hacking, power: 1 },
  1: { type: FragmentType.Hacking, power: 1 },
  5: { type: FragmentType.HackingSpeed, power: 1.3 },
  6: { type: FragmentType.HackingMoney, power: 2 },
  7: { type: FragmentType.HackingGrow, power: 0.5 },
  10: { type: FragmentType.Strength, power: 2 },
  12: { type: FragmentType.Defense, power: 2 },
  14: { type: FragmentType.Dexterity, power: 2 },
  16: { type: FragmentType.Agility, power: 2 },
  18: { type: FragmentType.Charisma, power: 3 },
  20: { type: FragmentType.HacknetMoney, power: 1 },
  21: { type: FragmentType.HacknetCost, power: 2 },
  25: { type: FragmentType.Rep, power: 0.5 },
  27: { type: FragmentType.WorkMoney, power: 10 },
  28: { type: FragmentType.Crime, power: 2 },
  30: { type: FragmentType.Bladeburner, power: 0.4 },
  // Boosters (100-107) all have type Booster, power 1.1
  100: { type: FragmentType.Booster, power: 1.1 },
  101: { type: FragmentType.Booster, power: 1.1 },
  102: { type: FragmentType.Booster, power: 1.1 },
  103: { type: FragmentType.Booster, power: 1.1 },
  104: { type: FragmentType.Booster, power: 1.1 },
  105: { type: FragmentType.Booster, power: 1.1 },
  106: { type: FragmentType.Booster, power: 1.1 },
  107: { type: FragmentType.Booster, power: 1.1 },
};

// Go opponent types that affect multipliers
const GoOpponent = {
  Netburners: 'Netburners',
  SlumSnakes: 'Slum Snakes',
  TheBlackHand: 'The Black Hand',
  Tetrads: 'Tetrads',
  Daedalus: 'Daedalus',
  Illuminati: 'Illuminati',
  w0r1d_d43m0n: '????????????',
} as const;

// Go opponent bonus power factors (from Go/Constants.ts opponentDetails)
const GO_BONUS_POWER: Record<string, number> = {
  [GoOpponent.Netburners]: 1.3,
  [GoOpponent.SlumSnakes]: 1.2,
  [GoOpponent.TheBlackHand]: 0.9,
  [GoOpponent.Tetrads]: 0.7,
  [GoOpponent.Daedalus]: 1.1,
  [GoOpponent.Illuminati]: 0.7,
  [GoOpponent.w0r1d_d43m0n]: 2,
};

export const MULTIPLIER_FIELDS = [
  'hacking_chance',
  'hacking_speed',
  'hacking_money',
  'hacking_grow',
  'hacking',
  'hacking_exp',
  'strength',
  'strength_exp',
  'defense',
  'defense_exp',
  'dexterity',
  'dexterity_exp',
  'agility',
  'agility_exp',
  'charisma',
  'charisma_exp',
  'hacknet_node_money',
  'hacknet_node_purchase_cost',
  'hacknet_node_ram_cost',
  'hacknet_node_core_cost',
  'hacknet_node_level_cost',
  'company_rep',
  'faction_rep',
  'work_money',
  'crime_success',
  'crime_money',
  'bladeburner_max_stamina',
  'bladeburner_stamina_gain',
  'bladeburner_analysis',
  'bladeburner_success_chance',
] as const;

export type MultiplierField = (typeof MULTIPLIER_FIELDS)[number];

interface MultiplierBreakdown {
  label: string;
  factor: number;
}

export interface MultiplierComputation {
  field: MultiplierField;
  saved: number;
  calculated: number;
  breakdown: MultiplierBreakdown[];
}

// Minimal BitNode multiplier table for hacking level multiplier (others default to 1)
const BITNODE_HACKING_LEVEL_MULT: Record<number, number> = {
  2: 0.8,
  3: 0.8,
  6: 0.35,
  7: 0.35,
  8: 0.5,
  9: 0.35,
  10: 0.6,
};

const SF1_FIELDS: MultiplierField[] = [
  'hacking_chance',
  'hacking_speed',
  'hacking_money',
  'hacking_grow',
  'hacking',
  'strength',
  'defense',
  'dexterity',
  'agility',
  'charisma',
  'hacking_exp',
  'strength_exp',
  'defense_exp',
  'dexterity_exp',
  'agility_exp',
  'charisma_exp',
  'company_rep',
  'faction_rep',
  'crime_money',
  'crime_success',
  'hacknet_node_money',
  'hacknet_node_purchase_cost',
  'hacknet_node_ram_cost',
  'hacknet_node_core_cost',
  'hacknet_node_level_cost',
  'work_money',
];

const SF5_FIELDS: MultiplierField[] = [
  'hacking_chance',
  'hacking_speed',
  'hacking_money',
  'hacking_grow',
  'hacking',
  'hacking_exp',
];

const SF2_FIELDS: MultiplierField[] = [
  'crime_money',
  'crime_success',
  'charisma',
];

const SF3_FIELDS: MultiplierField[] = [
  'charisma',
  'work_money',
];

const SF6_FIELDS: MultiplierField[] = [
  'strength',
  'defense',
  'dexterity',
  'agility',
  'strength_exp',
  'defense_exp',
  'dexterity_exp',
  'agility_exp',
];

const SF7_FIELDS: MultiplierField[] = [
  'bladeburner_max_stamina',
  'bladeburner_stamina_gain',
  'bladeburner_analysis',
  'bladeburner_success_chance',
];

const SF8_FIELDS: MultiplierField[] = ['hacking_grow'];

const SF9_FIELDS_INC: MultiplierField[] = ['hacknet_node_money'];
const SF9_FIELDS_DEC: MultiplierField[] = [
  'hacknet_node_purchase_cost',
  'hacknet_node_ram_cost',
  'hacknet_node_core_cost',
  'hacknet_node_level_cost',
];

const SF11_FIELDS: MultiplierField[] = ['work_money', 'company_rep'];

/**
 * Calculate Stanek's Gift fragment effect.
 * Formula: 1 + (ln(highestCharge + 1) / 60) * ((numCharge + 1) / 5)^0.07 * power * boost * StaneksGiftPowerMultiplier
 * StaneksGiftPowerMultiplier defaults to 1 in most BitNodes.
 */
function calculateStanekFragmentEffect(
  highestCharge: number,
  numCharge: number,
  power: number,
  boost: number,
  stanekPowerMult = 1
): number {
  return (
    1 +
    (Math.log(highestCharge + 1) / 60) *
      Math.pow((numCharge + 1) / 5, 0.07) *
      power *
      boost *
      stanekPowerMult
  );
}

/**
 * Calculate Go effect for a faction.
 * Formula: 1 + ln(nodes + 1) * (nodes + 1)^0.3 * 0.002 * power * GoPower * sourceFileBonus
 * GoPower defaults to 1. sourceFileBonus is 2 if SF14 active, else 1.
 */
function calculateGoEffect(nodePower: number, bonusPower: number, goPowerMult = 1, sf14Active = false): number {
  const sourceFileBonus = sf14Active ? 2 : 1;
  return 1 + Math.log(nodePower + 1) * Math.pow(nodePower + 1, 0.3) * 0.002 * bonusPower * goPowerMult * sourceFileBonus;
}

/**
 * Get Stanek fragment multipliers from save data.
 * Simplified version - doesn't handle booster fragment adjacency detection.
 */
function calculateStanekMultipliers(
  stanekData: { fragments?: Array<{ id: number; highestCharge: number; numCharge: number; x: number; y: number }> } | null,
  stanekPowerMult = 1
): { mults: Partial<Record<MultiplierField, number>>; breakdown: MultiplierBreakdown[] } {
  const mults: Partial<Record<MultiplierField, number>> = {};
  const breakdown: MultiplierBreakdown[] = [];

  if (!stanekData?.fragments?.length) {
    return { mults, breakdown };
  }

  // Note: This is a simplified calculation that doesn't account for booster adjacency
  // The full calculation would require grid position analysis
  for (const activeFragment of stanekData.fragments) {
    const fragmentInfo = FRAGMENT_DATA[activeFragment.id];
    if (!fragmentInfo || fragmentInfo.type === FragmentType.Booster) continue;

    // Simplified: assume boost = 1 (no adjacent boosters)
    const effect = calculateStanekFragmentEffect(
      activeFragment.highestCharge,
      activeFragment.numCharge,
      fragmentInfo.power,
      1, // boost - would need adjacency calculation for accurate value
      stanekPowerMult
    );

    if (effect === 1) continue;

    const label = `Stanek Fragment #${activeFragment.id}`;

    switch (fragmentInfo.type) {
      case FragmentType.HackingSpeed:
        mults.hacking_speed = (mults.hacking_speed ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.HackingMoney:
        mults.hacking_money = (mults.hacking_money ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.HackingGrow:
        mults.hacking_grow = (mults.hacking_grow ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Hacking:
        mults.hacking = (mults.hacking ?? 1) * effect;
        mults.hacking_exp = (mults.hacking_exp ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Strength:
        mults.strength = (mults.strength ?? 1) * effect;
        mults.strength_exp = (mults.strength_exp ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Defense:
        mults.defense = (mults.defense ?? 1) * effect;
        mults.defense_exp = (mults.defense_exp ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Dexterity:
        mults.dexterity = (mults.dexterity ?? 1) * effect;
        mults.dexterity_exp = (mults.dexterity_exp ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Agility:
        mults.agility = (mults.agility ?? 1) * effect;
        mults.agility_exp = (mults.agility_exp ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Charisma:
        mults.charisma = (mults.charisma ?? 1) * effect;
        mults.charisma_exp = (mults.charisma_exp ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.HacknetMoney:
        mults.hacknet_node_money = (mults.hacknet_node_money ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.HacknetCost:
        mults.hacknet_node_purchase_cost = (mults.hacknet_node_purchase_cost ?? 1) / effect;
        mults.hacknet_node_ram_cost = (mults.hacknet_node_ram_cost ?? 1) / effect;
        mults.hacknet_node_core_cost = (mults.hacknet_node_core_cost ?? 1) / effect;
        mults.hacknet_node_level_cost = (mults.hacknet_node_level_cost ?? 1) / effect;
        breakdown.push({ label, factor: 1 / effect });
        break;
      case FragmentType.Rep:
        mults.company_rep = (mults.company_rep ?? 1) * effect;
        mults.faction_rep = (mults.faction_rep ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.WorkMoney:
        mults.work_money = (mults.work_money ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Crime:
        mults.crime_success = (mults.crime_success ?? 1) * effect;
        mults.crime_money = (mults.crime_money ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case FragmentType.Bladeburner:
        mults.bladeburner_max_stamina = (mults.bladeburner_max_stamina ?? 1) * effect;
        mults.bladeburner_stamina_gain = (mults.bladeburner_stamina_gain ?? 1) * effect;
        mults.bladeburner_analysis = (mults.bladeburner_analysis ?? 1) * effect;
        mults.bladeburner_success_chance = (mults.bladeburner_success_chance ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
    }
  }

  return { mults, breakdown };
}

/**
 * Get Go/IPvGO multipliers from save data.
 */
function calculateGoMultipliers(
  goStats: Record<string, { nodePower?: number; wins?: number; losses?: number }> | null,
  sf14Level: number,
  goPowerMult = 1
): { mults: Partial<Record<MultiplierField, number>>; breakdown: MultiplierBreakdown[] } {
  const mults: Partial<Record<MultiplierField, number>> = {};
  const breakdown: MultiplierBreakdown[] = [];

  if (!goStats || Object.keys(goStats).length === 0) {
    return { mults, breakdown };
  }

  const sf14Active = sf14Level > 0;

  for (const [opponent, stats] of Object.entries(goStats)) {
    const nodePower = stats.nodePower ?? 0;
    if (nodePower === 0) continue;

    const bonusPower = GO_BONUS_POWER[opponent] ?? 1;
    const effect = calculateGoEffect(nodePower, bonusPower, goPowerMult, sf14Active);

    if (effect === 1) continue;

    const label = `Go: ${opponent}`;

    switch (opponent) {
      case GoOpponent.Netburners:
        mults.hacknet_node_money = (mults.hacknet_node_money ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case GoOpponent.SlumSnakes:
        mults.crime_success = (mults.crime_success ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case GoOpponent.TheBlackHand:
        mults.hacking_money = (mults.hacking_money ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case GoOpponent.Tetrads:
        mults.strength = (mults.strength ?? 1) * effect;
        mults.defense = (mults.defense ?? 1) * effect;
        mults.dexterity = (mults.dexterity ?? 1) * effect;
        mults.agility = (mults.agility ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case GoOpponent.Daedalus:
        mults.company_rep = (mults.company_rep ?? 1) * effect;
        mults.faction_rep = (mults.faction_rep ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case GoOpponent.Illuminati:
        mults.hacking_speed = (mults.hacking_speed ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
      case GoOpponent.w0r1d_d43m0n:
        mults.hacking = (mults.hacking ?? 1) * effect;
        breakdown.push({ label, factor: effect });
        break;
    }
  }

  return { mults, breakdown };
}

/**
 * Detect which Circadian Modulator bonus set was active by comparing saved vs computed multipliers.
 * Returns the bonus set index (0-6) or -1 if not detected.
 */
function detectCircadianBonusSet(
  savedMults: Record<string, number>,
  computedWithoutCircadian: Record<string, number>
): number {
  // For each bonus set, check if the ratio of saved/computed matches the expected bonus
  for (let i = 0; i < CIRCADIAN_BONUS_SETS.length; i++) {
    const bonusSet = CIRCADIAN_BONUS_SETS[i];
    const key = bonusSet.detectionKey;
    const expectedValue = bonusSet.detectionValue;

    const saved = savedMults[key] ?? 1;
    const computed = computedWithoutCircadian[key] ?? 1;

    if (computed === 0) continue;

    const ratio = saved / computed;
    // Check if ratio is within 1% of the expected value
    if (Math.abs(ratio - expectedValue) < expectedValue * 0.01) {
      return i;
    }
  }
  return -1;
}

/**
 * Get the Circadian Modulator multiplier for a specific field given the active bonus set.
 */
function getCircadianMultiplier(field: MultiplierField, bonusSetIndex: number): number {
  if (bonusSetIndex < 0 || bonusSetIndex >= CIRCADIAN_BONUS_SETS.length) {
    return 1;
  }
  const bonuses = CIRCADIAN_BONUS_SETS[bonusSetIndex].bonuses;
  return (bonuses as Record<string, number | undefined>)[field] ?? 1;
}

/**
 * Infer the NFG donation bonus from saved vs computed multipliers.
 * The game's NFG multiplier is (1.01 + CONSTANTS.Donations / 1e8) per level.
 * Since Donations changes over time, we infer it from the ratio of saved/computed.
 * Returns the full NFG multiplier per level (base + donation bonus).
 */
function inferNfgMultiplier(
  savedMults: Record<string, number>,
  computedWithoutDonation: Record<string, number>,
  nfgLevel: number
): number {
  const BASE_NFG = 1.01;

  if (nfgLevel <= 0) return BASE_NFG;

  // Use 'hacking' field as reference since it's commonly affected by NFG
  // and less likely to have other variable bonuses
  const savedHacking = savedMults['hacking'] ?? 1;
  const computedHacking = computedWithoutDonation['hacking'] ?? 1;

  if (computedHacking === 0 || savedHacking === 0) return BASE_NFG;

  const ratio = savedHacking / computedHacking;

  // If ratio is very close to 1, no donation bonus needed
  if (Math.abs(ratio - 1) < 0.0001) return BASE_NFG;

  // ratio = (nfgWithBonus / nfgBase)^level
  // So: nfgWithBonus / nfgBase = ratio^(1/level)
  // And: nfgWithBonus = nfgBase * ratio^(1/level)
  const nfgBase = Math.pow(BASE_NFG, nfgLevel);
  const inferredNfgTotal = nfgBase * ratio;
  const inferredNfgPerLevel = Math.pow(inferredNfgTotal, 1 / nfgLevel);

  // Sanity check: the inferred multiplier should be between 1.01 and 1.0101
  // (donation bonus should be small, in the range of 0 to ~0.0001)
  if (inferredNfgPerLevel < BASE_NFG || inferredNfgPerLevel > 1.0101) {
    return BASE_NFG;
  }

  return inferredNfgPerLevel;
}

function applySourceFileBonus(field: MultiplierField, sourceFile: number, level: number): number {
  if (level <= 0) return 1;

  let percent = 0;
  switch (sourceFile) {
    case 3: {
      for (let i = 0; i < level; i++) percent += 8 / 2 ** i;
      if (SF3_FIELDS.includes(field)) {
        return 1 + percent / 100;
      }
      break;
    }
    case 6: {
      for (let i = 0; i < level; i++) percent += 8 / 2 ** i;
      if (SF6_FIELDS.includes(field)) {
        return 1 + percent / 100;
      }
      break;
    }
    case 7: {
      for (let i = 0; i < level; i++) percent += 8 / 2 ** i;
      if (SF7_FIELDS.includes(field)) {
        return 1 + percent / 100;
      }
      break;
    }
    case 8: {
      for (let i = 0; i < level; i++) percent += 12 / 2 ** i;
      if (SF8_FIELDS.includes(field)) {
        return 1 + percent / 100;
      }
      break;
    }
    case 9: {
      for (let i = 0; i < level; i++) percent += 12 / 2 ** i;
      if (SF9_FIELDS_INC.includes(field)) {
        return 1 + percent / 100;
      }
      if (SF9_FIELDS_DEC.includes(field)) {
        return 1 - percent / 100;
      }
      break;
    }
    case 11: {
      for (let i = 0; i < level; i++) percent += 32 / 2 ** i;
      if (SF11_FIELDS.includes(field)) {
        return 1 + percent / 100;
      }
      break;
    }
    case 2: {
      for (let i = 0; i < level; i++) percent += 24 / 2 ** i;
      if (SF2_FIELDS.includes(field)) {
        return 1 + percent / 100;
      }
      break;
    }
    case 1: {
      for (let i = 0; i < level; i++) percent += 16 / 2 ** i;
      if (SF1_FIELDS.includes(field)) {
        if (
          field === 'hacknet_node_purchase_cost' ||
          field === 'hacknet_node_ram_cost' ||
          field === 'hacknet_node_core_cost' ||
          field === 'hacknet_node_level_cost'
        ) {
          return 1 / (1 + percent / 100);
        }
        return 1 + percent / 100;
      }
      break;
    }
    case 5: {
      for (let i = 0; i < level; i++) percent += 8 / 2 ** i;
      if (SF5_FIELDS.includes(field)) {
        return 1 + percent / 100;
      }
      break;
    }
    default:
      return 1;
  }
  return 1;
}

/**
 * Look up augmentation multiplier from AUGMENTATION_DATA.
 * Matches by key, canonical name, or alias.
 * @param nfgMultOverride - Optional override for NFG per-level multiplier (to account for donation bonus)
 */
function applyAugmentationMults(
  field: MultiplierField,
  name: string,
  level: number,
  nfgMultOverride?: number
): number {
  // Find the augmentation key that matches this name
  const augKey = ALL_AUGMENTATIONS.find((key) => nameMatchesAugmentation(name, key));
  if (!augKey) return 1;

  const augData = AUGMENTATION_DATA[augKey];
  if (!augData?.multipliers) return 1;

  let multiplier = augData.multipliers[field];
  if (multiplier === undefined) return 1;

  // NeuroFlux Governor stacks multiplicatively per level
  // The game adds a tiny donation bonus at runtime: (1.01 + Donations/1e8)
  // If nfgMultOverride is provided, use it; otherwise use base 1.01
  if (augKey === 'NeuroFluxGovernor') {
    const nfgBase = nfgMultOverride ?? (multiplier > 1 ? 1.01 : 1 / 1.01);
    // For cost reduction fields (multiplier < 1), invert the override
    if (multiplier < 1 && nfgMultOverride) {
      return Math.pow(1 / nfgMultOverride, level);
    }
    return Math.pow(nfgBase, level);
  }

  return multiplier;
}

export function computeAllMultipliers(
  player: ParsedSaveData['PlayerSave']['data'],
  stanekData?: { fragments?: Array<{ id: number; highestCharge: number; numCharge: number; x: number; y: number }> } | null,
  goStats?: Record<string, { nodePower?: number; wins?: number; losses?: number }> | null
): MultiplierComputation[] {
  const baseSourceFiles: Record<number, number> = Object.fromEntries(player.sourceFiles.data ?? []);
  const overrides: Record<number, number> =
    player.bitNodeOptions?.sourceFileOverrides?.data
      ? Object.fromEntries(player.bitNodeOptions.sourceFileOverrides.data)
      : {};
  const sourceFiles: Record<number, number> = { ...baseSourceFiles, ...overrides };
  const exploitCount = player.exploits?.length ?? 0;

  // Calculate Stanek and Go multipliers once
  const stanekResult = calculateStanekMultipliers(stanekData ?? null);
  const goResult = calculateGoMultipliers(goStats ?? null, sourceFiles[14] ?? 0);

  // Check if player has Unstable Circadian Modulator
  const hasCircadianMod = player.augmentations.some(
    (aug) => nameMatchesAugmentation(aug.name, 'UnstableCircadianModulator')
  );

  // Find NFG level for donation bonus inference
  const nfgAug = player.augmentations.find((aug) =>
    nameMatchesAugmentation(aug.name, 'NeuroFluxGovernor')
  );
  const nfgLevel = nfgAug?.level ?? 0;

  // First pass: compute multipliers without variable bonuses (Circadian, NFG donation)
  // to detect which bonus sets are active
  const computedWithoutVariables: Record<string, number> = {};
  for (const field of MULTIPLIER_FIELDS) {
    let value = 1;
    // Source files
    for (const sfNum of [1, 2, 3, 5, 6, 7, 8, 9, 11]) {
      value *= applySourceFileBonus(field, sfNum, sourceFiles[sfNum] ?? 0);
    }
    // Augmentations (excluding Circadian, using base NFG without donation)
    for (const aug of player.augmentations) {
      if (!nameMatchesAugmentation(aug.name, 'UnstableCircadianModulator')) {
        value *= applyAugmentationMults(field, aug.name, aug.level ?? 1);
      }
    }
    // BitNode
    if (field === 'hacking') {
      value *= BITNODE_HACKING_LEVEL_MULT[player.bitNodeN] ?? 1;
    }
    // Stanek
    const stanekMult = stanekResult.mults[field];
    if (stanekMult !== undefined) value *= stanekMult;
    // Go
    const goMult = goResult.mults[field];
    if (goMult !== undefined) value *= goMult;
    // Exploits
    if (exploitCount > 0) {
      const isCostField = field.includes('_cost');
      value *= isCostField ? Math.pow(1 / EXPLOIT_MULT, exploitCount) : Math.pow(EXPLOIT_MULT, exploitCount);
    }
    computedWithoutVariables[field] = value;
  }

  // Detect Circadian bonus set
  const circadianBonusIndex = hasCircadianMod
    ? detectCircadianBonusSet(player.mults, computedWithoutVariables)
    : -1;

  // Apply Circadian bonus to the computed values for NFG inference
  if (circadianBonusIndex >= 0) {
    for (const field of MULTIPLIER_FIELDS) {
      const circadianFactor = getCircadianMultiplier(field, circadianBonusIndex);
      computedWithoutVariables[field] *= circadianFactor;
    }
  }

  // Infer NFG donation bonus from remaining difference
  const inferredNfgMult = inferNfgMultiplier(player.mults, computedWithoutVariables, nfgLevel);

  return MULTIPLIER_FIELDS.map((field) => {
    const breakdown: MultiplierBreakdown[] = [];
    let value = 1;

    // Source files - apply all that have effects
    for (const sfNum of [1, 2, 3, 5, 6, 7, 8, 9, 11]) {
      const sfBonus = applySourceFileBonus(field, sfNum, sourceFiles[sfNum] ?? 0);
      if (sfBonus !== 1) {
        value *= sfBonus;
        breakdown.push({ label: `Source-File ${sfNum}`, factor: sfBonus });
      }
    }

    // Augmentations
    for (const aug of player.augmentations) {
      // Skip Circadian Modulator here - we handle it separately
      if (nameMatchesAugmentation(aug.name, 'UnstableCircadianModulator')) {
        continue;
      }
      const augFactor = applyAugmentationMults(field, aug.name, aug.level ?? 1, inferredNfgMult);
      if (augFactor !== 1) {
        value *= augFactor;
        breakdown.push({ label: `Aug: ${aug.name}`, factor: augFactor });
      }
    }

    // Unstable Circadian Modulator - apply detected bonus set
    if (hasCircadianMod && circadianBonusIndex >= 0) {
      const circadianFactor = getCircadianMultiplier(field, circadianBonusIndex);
      if (circadianFactor !== 1) {
        value *= circadianFactor;
        const bonusSetName = CIRCADIAN_BONUS_SETS[circadianBonusIndex].name;
        breakdown.push({ label: `Aug: Unstable Circadian Modulator (${bonusSetName})`, factor: circadianFactor });
      }
    }

    // BitNode multiplier (only hacking level)
    if (field === 'hacking') {
      const bitnodeMult = BITNODE_HACKING_LEVEL_MULT[player.bitNodeN] ?? 1;
      if (bitnodeMult !== 1) {
        value *= bitnodeMult;
        breakdown.push({ label: `BitNode ${player.bitNodeN} HackingLevelMultiplier`, factor: bitnodeMult });
      }
    }

    // Stanek's Gift fragment bonuses
    const stanekMult = stanekResult.mults[field];
    if (stanekMult !== undefined && stanekMult !== 1) {
      value *= stanekMult;
      // Add relevant breakdown items
      for (const item of stanekResult.breakdown) {
        if (item.factor !== 1) {
          breakdown.push(item);
        }
      }
    }

    // Go/IPvGO bonuses
    const goMult = goResult.mults[field];
    if (goMult !== undefined && goMult !== 1) {
      value *= goMult;
      // Add relevant breakdown items
      for (const item of goResult.breakdown) {
        if (item.factor !== 1) {
          breakdown.push(item);
        }
      }
    }

    // Exploits
    const exploitEligible =
      field === 'hacking_chance' ||
      field === 'hacking_speed' ||
      field === 'hacking_money' ||
      field === 'hacking_grow' ||
      field === 'hacking' ||
      field === 'strength' ||
      field === 'defense' ||
      field === 'dexterity' ||
      field === 'agility' ||
      field === 'charisma' ||
      field === 'hacking_exp' ||
      field === 'strength_exp' ||
      field === 'defense_exp' ||
      field === 'dexterity_exp' ||
      field === 'agility_exp' ||
      field === 'charisma_exp' ||
      field === 'company_rep' ||
      field === 'faction_rep' ||
      field === 'crime_money' ||
      field === 'crime_success' ||
      field === 'hacknet_node_money' ||
      field === 'hacknet_node_purchase_cost' ||
      field === 'hacknet_node_ram_cost' ||
      field === 'hacknet_node_core_cost' ||
      field === 'hacknet_node_level_cost' ||
      field === 'work_money';

    if (exploitCount > 0 && exploitEligible) {
      const inc = Math.pow(EXPLOIT_MULT, exploitCount);
      const dec = Math.pow(1 / EXPLOIT_MULT, exploitCount);
      let exploitFactor = 1;
      if (
        field === 'hacknet_node_purchase_cost' ||
        field === 'hacknet_node_ram_cost' ||
        field === 'hacknet_node_core_cost' ||
        field === 'hacknet_node_level_cost'
      ) {
        exploitFactor = dec;
      } else {
        exploitFactor = inc;
      }
      if (exploitFactor !== 1) {
        value *= exploitFactor;
        breakdown.push({ label: `Exploits (${exploitCount})`, factor: exploitFactor });
      }
    }

    return {
      field,
      saved: player.mults[field],
      calculated: value,
      breakdown,
    };
  });
}

export function computeHackingMultiplier(player: ParsedSaveData['PlayerSave']['data']): MultiplierComputation {
  return computeAllMultipliers(player).find((m) => m.field === 'hacking')!;
}
