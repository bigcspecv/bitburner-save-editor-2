import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { computeAllMultipliers, computeHackingMultiplier } from './multiplier-calculator';
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

describe('multiplier-calculator', () => {
  it('computes hacking multiplier close to saved value for sample save', () => {
    const player = loadSamplePlayer();
    const { calculated, saved } = computeHackingMultiplier(player);

    const delta = Math.abs(calculated - saved);
    expect(delta).toBeLessThan(0.005);
  });

  it('computes all multipliers and returns matching count', () => {
    const player = loadSamplePlayer();
    const all = computeAllMultipliers(player);
    expect(all.length).toBeGreaterThan(5);
    expect(all.find((m) => m.field === 'hacking')).toBeTruthy();
  });
});
