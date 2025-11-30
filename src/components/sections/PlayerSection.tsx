import { Card, NumberInput, ResetAction, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';
import type { PlayerSkills } from '../../models/types';
import { computeAllMultipliers } from '../../lib/multiplier-calculator';
import { computeAllSkillLevels } from '../../lib/level-calculator';
import { computeHealthStats } from '../../lib/hp-calculator';
import { useMemo } from 'react';

function formatDuration(ms?: number) {
  if (ms === undefined || ms === null) return '—';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const STAT_FIELDS: { key: keyof PlayerSkills; label: string }[] = [
  { key: 'hacking', label: 'Hacking' },
  { key: 'strength', label: 'Strength' },
  { key: 'defense', label: 'Defense' },
  { key: 'dexterity', label: 'Dexterity' },
  { key: 'agility', label: 'Agility' },
  { key: 'charisma', label: 'Charisma' },
  { key: 'intelligence', label: 'Intelligence' },
];

export function PlayerSection() {
  const player = useSaveStore((state) => state.currentSave?.PlayerSave.data);
  const originalPlayer = useSaveStore((state) => state.originalSave?.PlayerSave.data);
  const updatePlayerExp = useSaveStore((state) => state.updatePlayerExp);
  const updatePlayerResources = useSaveStore((state) => state.updatePlayerResources);
  const resetPlayerStats = useSaveStore((state) => state.resetPlayerStats);
  const resetPlayerResources = useSaveStore((state) => state.resetPlayerResources);
  const hasStatChanges = useSaveStore((state) => state.hasPlayerStatChanges());
  const hasResourceChanges = useSaveStore((state) => state.hasPlayerResourceChanges());
  const status = useSaveStore((state) => state.status);
  const isLoading = status === 'loading';

  const allMultipliers = useMemo(() => {
    if (!player) return null;
    return computeAllMultipliers(player);
  }, [player]);

  const allSkillLevels = useMemo(() => {
    if (!player) return null;
    return computeAllSkillLevels(player);
  }, [player]);

  const healthStats = useMemo(() => {
    if (!player) return null;
    const defenseLevel = allSkillLevels?.find((s) => s.field === 'defense')?.calculated;
    return computeHealthStats(player, { defenseLevelOverride: defenseLevel });
  }, [allSkillLevels, player]);
  if (!player) {
    return (
      <Card title="Player" subtitle="Load a save file to edit player data">
        <p className="text-terminal-dim text-sm">
          No save data loaded yet. Upload a save file to unlock player editing.
        </p>
      </Card>
    );
  }

  type ResourceField = 'money' | 'karma' | 'entropy';
  const handleResourceChange = (field: ResourceField) => (value: number) => {
    updatePlayerResources({ [field]: value } as Partial<Record<ResourceField, number>>);
  };

  const savedHp = originalPlayer?.hp ?? player.hp;
  const maxHpComputation = healthStats?.find((h) => h.field === 'hp_max');
  const currentHpComputation = healthStats?.find((h) => h.field === 'hp_current');
  const maxHpCalculated = maxHpComputation?.calculated ?? savedHp.max;
  const currentHpCalculated = currentHpComputation?.calculated ?? savedHp.current;
  const maxHpTag = maxHpComputation
    ? maxHpCalculated === savedHp.max
      ? 'MATCH'
      : maxHpCalculated > savedHp.max
        ? 'DIFF +'
        : 'DIFF -'
    : null;
  const currentHpTag = currentHpComputation
    ? currentHpCalculated === savedHp.current
      ? 'MATCH'
      : currentHpCalculated > savedHp.current
        ? 'DIFF +'
        : 'DIFF -'
    : null;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-4">
          <Card
            title="Money / Karma / Entropy"
            subtitle="Core progression resources"
            actions={
              <ResetAction
                title="Reset Money / Karma / Entropy"
                hasChanges={hasResourceChanges}
                onReset={resetPlayerResources}
                disabled={isLoading}
              />
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumberInput
                label="Money ($)"
                value={player.money}
                onChange={handleResourceChange('money')}
                min={0}
                showButtons={false}
              />
              <NumberInput
                label="Karma"
                value={player.karma}
                onChange={handleResourceChange('karma')}
                showButtons={false}
                step={1}
              />
              <NumberInput
                label="Entropy"
                value={player.entropy}
                onChange={handleResourceChange('entropy')}
                min={0}
                showButtons={false}
                step={1}
              />
            </div>
            <p className="text-terminal-dim text-xs mt-3">
              Karma is usually negative for criminal runs. Entropy stacks come from resets; multipliers
              are informational for now and will be surfaced separately.
            </p>
          </Card>

          <Card
            title="Stats & Skills"
            subtitle="Levels are derived from experience and multipliers; edit experience to influence final levels"
            actions={
              <ResetAction
                title="Reset Stats & Skills"
                hasChanges={hasStatChanges}
                onReset={resetPlayerStats}
                disabled={isLoading}
              />
            }
          >
            <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                  Health
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-terminal-primary text-sm space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-terminal-secondary text-xs uppercase tracking-wide">
                      In-Game Max HP
                    </span>
                    {maxHpTag && (
                      <span className="text-terminal-dim text-2xs uppercase">
                        {maxHpTag}
                      </span>
                    )}
                  </div>
                  <p>
                    Saved (raw):{' '}
                    <span className="text-terminal-secondary">{savedHp.max}</span>
                  </p>
                  <p>
                    Computed (in-game):{' '}
                    <span className="text-terminal-secondary">{maxHpCalculated}</span>
                  </p>
                </div>

                <div className="text-terminal-primary text-sm space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-terminal-secondary text-xs uppercase tracking-wide">
                      In-Game Current HP
                    </span>
                    {currentHpTag && (
                      <span className="text-terminal-dim text-2xs uppercase">
                        {currentHpTag}
                      </span>
                    )}
                  </div>
                  <p>
                    Saved (raw):{' '}
                    <span className="text-terminal-secondary">{savedHp.current}</span>
                  </p>
                  <p>
                    Computed (in-game):{' '}
                    <span className="text-terminal-secondary">{currentHpCalculated}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAT_FIELDS.map((stat) => (
                <div
                  key={stat.key}
                  className="border border-terminal-primary/40 bg-terminal-dim/5 p-3"
                >
                  {(() => {
                    const savedLevel = originalPlayer?.skills[stat.key] ?? player.skills[stat.key];
                    const computation = allSkillLevels?.find((s) => s.field === stat.key);
                    const computedLevel = computation?.calculated ?? savedLevel;
                    const matches = computation ? savedLevel === computedLevel : true;
                    const tag = matches
                      ? 'MATCH'
                      : computedLevel > savedLevel
                        ? 'DIFF +'
                        : 'DIFF -';

                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                            {stat.label}
                          </h4>
                          {allSkillLevels && (
                            <span className="text-terminal-dim text-2xs uppercase" title="Recomputed from EXP and multipliers">
                              {tag}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-terminal-primary text-sm">
                            <p>
                              From Original Save:{' '}
                              <span className="text-terminal-secondary">
                                {originalPlayer?.skills[stat.key] ?? player.skills[stat.key]}
                              </span>
                            </p>
                            <p>
                              Computed (New Save):{' '}
                              <span className="text-terminal-secondary">
                                {computedLevel}
                              </span>
                            </p>
                          </div>
                          <NumberInput
                            label="Experience"
                            value={player.exp[stat.key]}
                            onChange={(value) => updatePlayerExp(stat.key, value)}
                            min={0}
                            showButtons={false}
                            step={1000}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </Card>

        </div>
      ),
    },
    {
      id: 'game-data',
      label: 'Game Data',
      content: (
        <div className="space-y-4">
          <Card
            title="Identity"
            subtitle="Run context (read-only)"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                    Run
                  </h4>
                </div>
                <p className="text-terminal-primary text-sm">
                  BitNode: <span className="text-terminal-secondary">{player.bitNodeN}</span>
                </p>
                <p className="text-terminal-primary text-sm">
                  Identifier: <span className="text-terminal-secondary">{player.identifier}</span>
                </p>
                <p className="text-terminal-dim text-xs mt-2">
                  Source File overrides: {
                    Array.isArray(player.bitNodeOptions?.sourceFileOverrides?.data)
                      ? player.bitNodeOptions.sourceFileOverrides.data.length
                      : 0
                  }
                </p>
                <p className="text-terminal-dim text-xs">
                  Market access: WSE {player.hasWseAccount ? 'Yes' : 'No'} · TIX {player.hasTixApiAccess ? 'Yes' : 'No'} · 4S {player.has4SData ? 'Yes' : 'No'} · 4S TIX {player.has4SDataTixApi ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                    Location
                  </h4>
                </div>
                <p className="text-terminal-primary text-sm">
                  City: <span className="text-terminal-secondary">{player.city}</span>
                </p>
                <p className="text-terminal-primary text-sm">
                  Area: <span className="text-terminal-secondary">{player.location}</span>
                </p>
                <p className="text-terminal-primary text-sm">
                  Current Server: <span className="text-terminal-secondary">{player.currentServer}</span>
                </p>
              </div>

              <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                    Jobs & Work
                  </h4>
                </div>
                {(() => {
                  const jobEntries = Object.entries(player.jobs ?? {});
                  const preview = jobEntries.slice(0, 3);
                  const extra = jobEntries.length - preview.length;
                  const currentWork =
                    player.currentWork && typeof player.currentWork === 'object' && 'data' in player.currentWork
                      ? (player.currentWork as { data?: { type?: string; companyName?: string } }).data
                      : null;
                  return (
                    <div className="space-y-2 text-terminal-primary text-sm">
                      <div>
                        <p className="text-terminal-secondary text-xs uppercase tracking-wide mb-1">
                          Active Jobs ({jobEntries.length || 0})
                        </p>
                        {jobEntries.length === 0 ? (
                          <p className="text-terminal-dim text-xs">None</p>
                        ) : (
                          <>
                            {preview.map(([company, title]) => (
                              <p key={company}>
                                <span className="text-terminal-secondary">{company}</span>: {title}
                              </p>
                            ))}
                            {extra > 0 && (
                              <p className="text-terminal-dim text-xs">+{extra} more</p>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <p className="text-terminal-secondary text-xs uppercase tracking-wide mb-1">
                          Current Work
                        </p>
                        {currentWork ? (
                          <p>
                            {currentWork.type ?? 'Work'}{currentWork.companyName ? ` @ ${currentWork.companyName}` : ''}
                          </p>
                        ) : (
                          <p className="text-terminal-dim text-xs">Not working</p>
                        )}
                        <p className="text-terminal-dim text-xs mt-1">
                          Focus: {player.focus ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                    Playtime
                  </h4>
                </div>
                <p className="text-terminal-primary text-sm">
                  Since last Aug: <span className="text-terminal-secondary">{formatDuration(player.playtimeSinceLastAug)}</span>
                </p>
                <p className="text-terminal-primary text-sm">
                  Since last BitNode: <span className="text-terminal-secondary">{formatDuration(player.playtimeSinceLastBitnode)}</span>
                </p>
                <p className="text-terminal-primary text-sm">
                  Total: <span className="text-terminal-secondary">{formatDuration(player.totalPlaytime)}</span>
                </p>
              </div>
            </div>
          </Card>

          {allMultipliers && (
            <Card
              title="Multipliers"
              subtitle="Computed value uses Source-File and augmentation effects; see console debug log for factors."
            >
              <p className="text-terminal-secondary text-xs mb-3">
                Matching values are rounded to 6 decimals; tiny floating-point differences are treated as matches.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allMultipliers.map((m) => {
                  const savedRounded = Math.round(m.saved * 1e6) / 1e6;
                  const computedRounded = Math.round(m.calculated * 1e6) / 1e6;
                  const delta = Math.abs(savedRounded - computedRounded);
                  const matched = delta < 1e-5;
                  const tag = matched
                    ? 'MATCH'
                    : computedRounded > savedRounded
                      ? 'DIFF +'
                      : 'DIFF -';
                  const displayComputed = matched ? savedRounded : computedRounded;
                  return (
                    <div
                      key={m.field}
                      className="border border-terminal-primary/40 bg-terminal-dim/5 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                          {m.field.replace(/_/g, ' ')}
                        </h4>
                        <span className="text-terminal-dim text-2xs uppercase">
                          {tag}{!matched ? ` ${delta.toFixed(8)}` : ''}
                        </span>
                      </div>
                      <p className="text-terminal-primary text-sm">
                        From Original Save:{' '}
                        <span className="text-terminal-secondary">{savedRounded.toFixed(6)}</span>
                      </p>
                      <p className="text-terminal-primary text-sm">
                        Computed (New Save):{' '}
                        <span className="text-terminal-secondary">{displayComputed.toFixed(6)}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {!allMultipliers && (
            <Card title="Multipliers" subtitle="No multiplier data available">
              <p className="text-terminal-dim text-sm">
                Multiplier data will be displayed once computed from the save file.
              </p>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        title="Player"
        subtitle="Character stats, skills, and resources"
      >
        <Tabs tabs={tabs} defaultTab="overview" />
      </Card>
    </div>
  );
}
