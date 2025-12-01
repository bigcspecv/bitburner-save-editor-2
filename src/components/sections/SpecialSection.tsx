import { Card, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function SpecialSection() {
  const staneksGift = useSaveStore((state) => state.currentSave?.StaneksGiftSave);
  const goSave = useSaveStore((state) => state.currentSave?.GoSave);
  const infiltrations = useSaveStore((state) => state.currentSave?.InfiltrationsSave);

  const hasStanek = staneksGift !== undefined && staneksGift !== null;
  const hasGo = goSave !== undefined && goSave !== null;
  const hasInfiltrations = infiltrations !== undefined && infiltrations !== null;

  const tabs = [
    {
      id: 'stanek',
      label: "Stanek's Gift",
      content: (
        <Card title="Stanek's Gift" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {hasStanek
              ? "Stanek's Gift data exists but requires schema implementation to edit."
              : "No Stanek's Gift data. Requires joining Church of the Machine God faction."}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Stanek's Gift is a fragment grid system providing multiplier bonuses.
            Full editing support requires implementing Fragment and ActiveFragment schemas.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Fragment placement and rotation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Fragment charge levels (highestCharge, numCharge)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Booster fragment adjacency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Grid size based on Source Files</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'go',
      label: 'Go (IPvGO)',
      content: (
        <Card title="Go (IPvGO)" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {hasGo
              ? 'Go minigame data exists but requires schema implementation to edit.'
              : 'No Go data in save file.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Go/IPvGO is a strategic board game with stats tracked per opponent.
            Full editing support requires implementing BoardState and OpponentStats schemas.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Current and previous game board states</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Stats per opponent (wins, losses, nodes, nodePower)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Win streaks (current, old, highest)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Node power affects multiplier bonuses</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'infiltrations',
      label: 'Infiltrations',
      content: (
        <Card title="Infiltrations" subtitle="Navigation stub — minimal save data">
          <p className="text-terminal-dim">
            {hasInfiltrations
              ? 'Infiltration data exists but may be minimal.'
              : 'No infiltration data in save file.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Infiltrations are live minigames with minimal persistent data.
            Most state is not saved between sessions.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Infiltration is a live minigame, not saved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Rewards are calculated at completion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Shadows of Anarchy faction discovery tracked separately</span>
            </li>
          </ul>
        </Card>
      ),
    },
  ];

  // Determine subtitle based on what's available
  let subtitle = 'Special game systems';
  const active: string[] = [];
  if (hasStanek) active.push('Stanek');
  if (hasGo) active.push('Go');
  if (active.length > 0) {
    subtitle = active.join(', ') + ' active';
  }

  return (
    <Card title="Special" subtitle={subtitle}>
      <div className="space-y-6">
        {/* Special Systems Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stanek's Gift */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Stanek's Gift
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasStanek ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasStanek ? 'Active' : 'Not Unlocked'}
                </span>
              </div>
            </div>
          </div>

          {/* Go */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Go (IPvGO)
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasGo ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasGo ? 'Data Present' : 'No Data'}
                </span>
              </div>
            </div>
          </div>

          {/* Infiltrations */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Infiltrations
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className="text-terminal-dim">Live Minigame</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="stanek" />
      </div>
    </Card>
  );
}
