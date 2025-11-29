import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { computeHealthStats } from './hp-calculator';
import { computeAllSkillLevels } from './level-calculator';
import type { ParsedSaveData } from '../models/types';

function loadSamplePlayer(): ParsedSaveData['PlayerSave']['data'] {
  const raw = readFileSync(
    join(process.cwd(), 'example-save-files', 'bitburnerSave_1764213129_BN4x3.json'),
    'utf-8'
  );
  const outer = JSON.parse(raw) as { data: { PlayerSave: string } };
  const player = JSON.parse(outer.data.PlayerSave) as ParsedSaveData['PlayerSave'];
  return player.data;
}

describe('hp-calculator', () => {
  it('recomputes max hp from defense level', () => {
    const player = loadSamplePlayer();
    const defenseLevel = computeAllSkillLevels(player).find((s) => s.field === 'defense')?.calculated ?? 1;

    const maxHp = computeHealthStats(player, { defenseLevelOverride: defenseLevel }).find(
      (h) => h.field === 'hp_max'
    );

    expect(maxHp?.calculated).toBe(Math.floor(10 + defenseLevel / 10));
  });

  it('preserves saved hp ratio when recomputing current hp', () => {
    const player = loadSamplePlayer();
    const defenseLevel = computeAllSkillLevels(player).find((s) => s.field === 'defense')?.calculated ?? 1;

    player.hp.current = player.hp.max * 1.5; // ratio above 1 should clamp to 1

    const healthStats = computeHealthStats(player, { defenseLevelOverride: defenseLevel });
    const maxHp = healthStats.find((h) => h.field === 'hp_max');
    const currentHp = healthStats.find((h) => h.field === 'hp_current');

    expect(maxHp).toBeTruthy();
    expect(currentHp?.calculated).toBe(maxHp?.calculated);
  });
});
