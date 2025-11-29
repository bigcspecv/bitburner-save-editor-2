import { Card, NumberInput, Button } from '../ui';
import { useSaveStore } from '../../store/save-store';
import type { PlayerSkills } from '../../models/types';

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
  const updatePlayerSkill = useSaveStore((state) => state.updatePlayerSkill);
  const updatePlayerExp = useSaveStore((state) => state.updatePlayerExp);
  const updatePlayerResources = useSaveStore((state) => state.updatePlayerResources);
  const resetPlayer = useSaveStore((state) => state.resetPlayer);
  const hasChanges = useSaveStore((state) => state.hasChanges());
  const status = useSaveStore((state) => state.status);
  const isLoading = status === 'loading';

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

  return (
    <div className="space-y-4">
      <Card
        title="Stats & Skills"
        subtitle="Adjust core stats and their experience values"
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={resetPlayer}
            disabled={!hasChanges || isLoading}
          >
            Reset Player
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                Health
              </h4>
            </div>
            <div className="text-terminal-primary text-sm space-y-1">
              <p>
                Current / Max: <span className="text-terminal-secondary">{player.hp.current}</span>
                {' / '}
                <span className="text-terminal-secondary">{player.hp.max}</span>
              </p>
              <p className="text-terminal-dim text-xs">
                HP is derived at load time from other stats/multipliers; it is shown for reference and
                not directly editable here.
              </p>
            </div>
          </div>

          <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                Identity
              </h4>
              <span className="text-terminal-dim text-xs uppercase">
                City: {player.city}
              </span>
            </div>
            <p className="text-terminal-primary text-sm">
              BitNode: <span className="text-terminal-secondary">{player.bitNodeN}</span>
            </p>
            <p className="text-terminal-dim text-xs mt-2">
              Identity and BitNode are shown for context; gameplay multipliers are read-only for now.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_FIELDS.map((stat) => (
            <div
              key={stat.key}
              className="border border-terminal-primary/40 bg-terminal-dim/5 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-terminal-secondary uppercase tracking-wide text-sm">
                  {stat.label}
                </h4>
                <span className="text-terminal-dim text-xs">
                  Lv {player.skills[stat.key]}
                </span>
              </div>
              <div className="space-y-2">
                <NumberInput
                  label="Level"
                  value={player.skills[stat.key]}
                  onChange={(value) => updatePlayerSkill(stat.key, value)}
                  min={0}
                />
                <NumberInput
                  label="Experience"
                  value={player.exp[stat.key]}
                  onChange={(value) => updatePlayerExp(stat.key, value)}
                  min={0}
                  showButtons={false}
                  step={1000}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Money / Karma / Entropy"
        subtitle="Core progression resources"
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
    </div>
  );
}
