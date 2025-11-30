import { Card, Tabs, NumberInput, Checkbox, ResetAction } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function GangsSection() {
  const gangData = useSaveStore((state) => state.currentSave?.AllGangsSave);
  const playerGang = useSaveStore((state) => state.currentSave?.PlayerSave.data.gang);
  const factionsSave = useSaveStore((state) => state.currentSave?.FactionsSave);
  const updateGangStats = useSaveStore((state) => state.updateGangStats);
  const updateFactionStats = useSaveStore((state) => state.updateFactionStats);
  const resetGang = useSaveStore((state) => state.resetGang);
  const hasGangChanges = useSaveStore((state) => state.hasGangChanges);

  if (!gangData || !playerGang) {
    return (
      <Card title="Gang" subtitle="Load a save file with gang data to edit">
        <p className="text-terminal-dim text-sm">
          No gang data loaded. Either no save file is loaded, or the player has not joined a gang yet.
        </p>
      </Card>
    );
  }

  const gang = playerGang.data;
  const gangFaction = factionsSave?.[gang.facName];

  const tabs = [
    {
      id: 'members',
      label: 'Members',
      content: (
        <div className="text-terminal-dim text-sm p-4 border border-terminal-primary/30">
          <p className="text-terminal-secondary uppercase mb-2">&gt; NOT IMPLEMENTED</p>
          <p>Gang member management will be added here.</p>
        </div>
      ),
    },
    {
      id: 'equipment',
      label: 'Equipment',
      content: (
        <div className="text-terminal-dim text-sm p-4 border border-terminal-primary/30">
          <p className="text-terminal-secondary uppercase mb-2">&gt; NOT IMPLEMENTED</p>
          <p>Gang equipment features will be added here.</p>
        </div>
      ),
    },
    {
      id: 'territory',
      label: 'Territory',
      content: (
        <div className="text-terminal-dim text-sm p-4 border border-terminal-primary/30">
          <p className="text-terminal-secondary uppercase mb-2">&gt; NOT IMPLEMENTED</p>
          <p>Territory warfare features will be added here.</p>
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Gang"
      subtitle={`${gang.facName} ${gang.isHackingGang ? '(Hacking)' : '(Combat)'}`}
      actions={
        <ResetAction
          hasChanges={hasGangChanges()}
          onReset={resetGang}
          title="Reset All Gang Data"
        />
      }
    >
      <div className="space-y-6">
        {/* Gang Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Editable Stats */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Stats
            </h3>
            <NumberInput
              label="Respect"
              value={gang.respect}
              onChange={(value) => updateGangStats({ respect: value })}
              min={0}
              showButtons={false}
            />
            <NumberInput
              label="Wanted Level"
              value={gang.wanted}
              onChange={(value) => updateGangStats({ wanted: value })}
              min={1}
              showButtons={false}
            />
            <NumberInput
              label="Territory Clash Chance (%)"
              value={gang.territoryClashChance * 100}
              onChange={(value) => updateGangStats({ territoryClashChance: value / 100 })}
              min={0}
              max={100}
              step={1}
              showButtons={false}
            />
          </div>

          {/* Faction & Settings */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Faction ({gang.facName})
            </h3>
            <NumberInput
              label="Faction Reputation"
              value={gangFaction?.playerReputation ?? 0}
              onChange={(value) => updateFactionStats(gang.facName, { playerReputation: value })}
              min={0}
              showButtons={false}
            />
            <NumberInput
              label="Faction Favor"
              value={gangFaction?.favor ?? 0}
              onChange={(value) => updateFactionStats(gang.facName, { favor: value })}
              min={0}
              showButtons={false}
            />

            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1 mt-6">
              &gt; Settings
            </h3>
            <Checkbox
              label="Territory Warfare Engaged"
              checked={gang.territoryWarfareEngaged}
              onChange={(e) => updateGangStats({ territoryWarfareEngaged: e.target.checked })}
            />
            <Checkbox
              label="Notify on Member Death"
              checked={gang.notifyMemberDeath}
              onChange={(e) => updateGangStats({ notifyMemberDeath: e.target.checked })}
            />
          </div>

          {/* Read-only Info */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Current Rates (Read-Only)
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Respect Gain:</span>
                <span className="text-terminal-primary">{gang.respectGainRate.toFixed(4)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-dim">Wanted Gain:</span>
                <span className="text-terminal-primary">{gang.wantedGainRate.toFixed(4)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-dim">Money Gain:</span>
                <span className="text-terminal-primary">${gang.moneyGainRate.toFixed(2)}/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-dim">Members:</span>
                <span className="text-terminal-primary">{gang.members.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="members" />
      </div>
    </Card>
  );
}

