import type { ParsedSaveData } from '../models/types';
import { computeAllSkillLevels } from './level-calculator';

type PlayerData = ParsedSaveData['PlayerSave']['data'];

export type HealthField = 'hp_max' | 'hp_current';

interface HealthBreakdown {
  label: string;
  value: number;
}

export interface HealthComputation {
  field: HealthField;
  saved: number;
  calculated: number;
  breakdown: HealthBreakdown[];
}

function calculateMaxHp(defenseLevel: number): number {
  return Math.floor(10 + defenseLevel / 10);
}

function resolveDefenseLevel(player: PlayerData, override?: number): number {
  const computed =
    typeof override === 'number'
      ? override
      : computeAllSkillLevels(player).find((s) => s.field === 'defense')?.calculated;

  // Use the greater of saved defense level and the recomputed one; saves can carry forward
  // already-calculated levels even if EXP/mults drift, and in-game HP uses the live defense level.
  const candidate = computed ?? player.skills.defense;
  return Math.max(candidate, player.skills.defense);
}

/**
 * Computes current/max HP using the in-game formula:
 * max = floor(10 + defense / 10); current preserves the saved ratio (clamped to 1) against the recomputed max.
 */
export function computeHealthStats(
  player: PlayerData,
  options?: { defenseLevelOverride?: number }
): HealthComputation[] {
  const defenseLevel = resolveDefenseLevel(player, options?.defenseLevelOverride);
  const savedMax = player.hp.max;
  const savedCurrent = player.hp.current;

  const calculatedMax = calculateMaxHp(defenseLevel);
  const ratio = savedMax > 0 ? Math.min(savedCurrent / savedMax, 1) : 1;
  const calculatedCurrent = Math.round(calculatedMax * ratio);

  return [
    {
      field: 'hp_max',
      saved: savedMax,
      calculated: calculatedMax,
      breakdown: [
        { label: 'Base', value: 10 },
        { label: 'Defense / 10', value: defenseLevel / 10 },
      ],
    },
    {
      field: 'hp_current',
      saved: savedCurrent,
      calculated: calculatedCurrent,
      breakdown: [
        { label: 'Saved ratio', value: ratio },
        { label: 'Recomputed max', value: calculatedMax },
      ],
    },
  ];
}
