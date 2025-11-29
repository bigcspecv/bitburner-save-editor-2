import type { ParsedSaveData } from '../models/types';

type PlayerData = ParsedSaveData['PlayerSave']['data'];

export const SKILL_FIELDS = [
  'hacking',
  'strength',
  'defense',
  'dexterity',
  'agility',
  'charisma',
  'intelligence',
] as const;

export type SkillField = (typeof SKILL_FIELDS)[number];

interface SkillLevelComputation {
  field: SkillField;
  saved: number;
  calculated: number;
  breakdown: {
    label: string;
    factor: number;
  }[];
}

interface LevelMultipliers {
  hacking: number;
  strength: number;
  defense: number;
  dexterity: number;
  agility: number;
  charisma: number;
}

function clampNumber(value: number, min = -Infinity, max = Infinity): number {
  return Math.min(Math.max(value, min), max);
}

function calculateSkill(exp: number, mult = 1): number {
  const value = Math.floor(mult * (32 * Math.log(exp + 534.6) - 200));
  return clampNumber(value, 1);
}

function buildBitNodeLevelMultipliers(bitNodeN: number, activeBitNodeLevel: number): LevelMultipliers {
  const multipliers: LevelMultipliers = {
    hacking: 1,
    strength: 1,
    defense: 1,
    dexterity: 1,
    agility: 1,
    charisma: 1,
  };

  switch (bitNodeN) {
    case 2:
    case 3:
      multipliers.hacking = 0.8;
      break;
    case 6:
    case 7:
      multipliers.hacking = 0.35;
      break;
    case 9:
      multipliers.hacking = 0.5;
      multipliers.strength = 0.45;
      multipliers.defense = 0.45;
      multipliers.dexterity = 0.45;
      multipliers.agility = 0.45;
      multipliers.charisma = 0.45;
      break;
    case 10:
      multipliers.hacking = 0.35;
      multipliers.strength = 0.4;
      multipliers.defense = 0.4;
      multipliers.dexterity = 0.4;
      multipliers.agility = 0.4;
      multipliers.charisma = 0.4;
      break;
    case 11:
      multipliers.hacking = 0.6;
      break;
    case 12: {
      const dec = 1 / Math.pow(1.02, Math.max(activeBitNodeLevel, 0));
      multipliers.hacking = dec;
      multipliers.strength = dec;
      multipliers.defense = dec;
      multipliers.dexterity = dec;
      multipliers.agility = dec;
      multipliers.charisma = dec;
      break;
    }
    case 13:
      multipliers.hacking = 0.25;
      multipliers.strength = 0.7;
      multipliers.defense = 0.7;
      multipliers.dexterity = 0.7;
      multipliers.agility = 0.7;
      break;
    case 14:
      multipliers.hacking = 0.4;
      multipliers.strength = 0.5;
      multipliers.defense = 0.5;
      multipliers.dexterity = 0.5;
      multipliers.agility = 0.5;
      break;
    default:
      break;
  }

  return multipliers;
}

function getActiveSourceFileLevel(player: PlayerData, n: number): number {
  const baseSourceFiles = Object.fromEntries(player.sourceFiles.data ?? []);
  const overrides = player.bitNodeOptions?.sourceFileOverrides?.data
    ? Object.fromEntries(player.bitNodeOptions.sourceFileOverrides.data)
    : {};

  const level = overrides[n] ?? baseSourceFiles[n] ?? 0;
  const isCurrentBitNode = player.bitNodeN === n;

  return level + (isCurrentBitNode ? 1 : 0);
}

export function computeAllSkillLevels(player: PlayerData): SkillLevelComputation[] {
  const activeBitNodeLevel = getActiveSourceFileLevel(player, player.bitNodeN);
  const bitNodeLevelMultipliers = buildBitNodeLevelMultipliers(player.bitNodeN, activeBitNodeLevel);

  return SKILL_FIELDS.map((field) => {
    const saved = player.skills[field];
    const exp = clampNumber(player.exp[field], 0);

    if (field === 'intelligence') {
      const calculatedInt = calculateSkill(exp, 1);
      return { field, saved, calculated: calculatedInt, breakdown: [] };
    }

    const bitNodeMult = bitNodeLevelMultipliers[field];
    const playerMult = player.mults[field];
    const combinedMult = playerMult * bitNodeMult;

    const calculated = calculateSkill(exp, combinedMult);
    const breakdown =
      combinedMult === 1
        ? []
        : [
            { label: 'Player multiplier', factor: playerMult },
            ...(bitNodeMult !== 1 ? [{ label: `BitNode ${player.bitNodeN} level mult`, factor: bitNodeMult }] : []),
          ];

    return {
      field,
      saved,
      calculated,
      breakdown,
    };
  });
}
