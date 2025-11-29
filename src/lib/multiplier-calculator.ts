import type { ParsedSaveData } from '../models/types';

const DONATION_BONUS = 212 / 1_000_000 / 100; // matches CONSTANTS.Donations handling in-game
const EXPLOIT_MULT = 1.001; // see applyExploit

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

const AUGMENTATION_MULTS: Record<
  string,
  Partial<Record<MultiplierField, number>>
> = {
  'BitWire': { hacking: 1.05 },
  'Neurotrainer I': {
    hacking_exp: 1.1,
    strength_exp: 1.1,
    defense_exp: 1.1,
    dexterity_exp: 1.1,
    agility_exp: 1.1,
    charisma_exp: 1.1,
  },
  'Synaptic Enhancement Implant': { hacking_speed: 1.03 },
  'NeuroFlux Governor': {
    hacking_chance: 1.01 + DONATION_BONUS,
    hacking_speed: 1.01 + DONATION_BONUS,
    hacking_money: 1.01 + DONATION_BONUS,
    hacking_grow: 1.01 + DONATION_BONUS,
    hacking: 1.01 + DONATION_BONUS,
    strength: 1.01 + DONATION_BONUS,
    defense: 1.01 + DONATION_BONUS,
    dexterity: 1.01 + DONATION_BONUS,
    agility: 1.01 + DONATION_BONUS,
    charisma: 1.01 + DONATION_BONUS,
    hacking_exp: 1.01 + DONATION_BONUS,
    strength_exp: 1.01 + DONATION_BONUS,
    defense_exp: 1.01 + DONATION_BONUS,
    dexterity_exp: 1.01 + DONATION_BONUS,
    agility_exp: 1.01 + DONATION_BONUS,
    charisma_exp: 1.01 + DONATION_BONUS,
    company_rep: 1.01 + DONATION_BONUS,
    faction_rep: 1.01 + DONATION_BONUS,
    crime_money: 1.01 + DONATION_BONUS,
    crime_success: 1.01 + DONATION_BONUS,
    hacknet_node_money: 1.01 + DONATION_BONUS,
    hacknet_node_purchase_cost: 1 / (1.01 + DONATION_BONUS),
    hacknet_node_ram_cost: 1 / (1.01 + DONATION_BONUS),
    hacknet_node_core_cost: 1 / (1.01 + DONATION_BONUS),
    hacknet_node_level_cost: 1 / (1.01 + DONATION_BONUS),
    work_money: 1.01 + DONATION_BONUS,
  },
};

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

function applyAugmentationMults(field: MultiplierField, name: string, level: number): number {
  const entry = AUGMENTATION_MULTS[name];
  if (!entry?.[field]) return 1;

  if (name === 'NeuroFlux Governor') {
    return entry[field]! ** level;
  }

  return entry[field]!;
}

export function computeAllMultipliers(player: ParsedSaveData['PlayerSave']['data']): MultiplierComputation[] {
  const baseSourceFiles: Record<number, number> = Object.fromEntries(player.sourceFiles.data ?? []);
  const overrides: Record<number, number> =
    player.bitNodeOptions?.sourceFileOverrides?.data
      ? Object.fromEntries(player.bitNodeOptions.sourceFileOverrides.data)
      : {};
  const sourceFiles: Record<number, number> = { ...baseSourceFiles, ...overrides };
  const exploitCount = player.exploits?.length ?? 0;

  return MULTIPLIER_FIELDS.map((field) => {
    const breakdown: MultiplierBreakdown[] = [];
    let value = 1;

    // Source files
    const sf1 = applySourceFileBonus(field, 1, sourceFiles[1] ?? 0);
    if (sf1 !== 1) {
      value *= sf1;
      breakdown.push({ label: 'Source-File 1', factor: sf1 });
    }

    const sf2 = applySourceFileBonus(field, 2, sourceFiles[2] ?? 0);
    if (sf2 !== 1) {
      value *= sf2;
      breakdown.push({ label: 'Source-File 2', factor: sf2 });
    }

    const sf5 = applySourceFileBonus(field, 5, sourceFiles[5] ?? 0);
    if (sf5 !== 1) {
      value *= sf5;
      breakdown.push({ label: 'Source-File 5', factor: sf5 });
    }

    // Augmentations
    for (const aug of player.augmentations) {
      const augFactor = applyAugmentationMults(field, aug.name, aug.level ?? 1);
      if (augFactor !== 1) {
        value *= augFactor;
        breakdown.push({ label: `Aug: ${aug.name}`, factor: augFactor });
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
