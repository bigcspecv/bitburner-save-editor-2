import { Card, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function BusinessSection() {
  const playerData = useSaveStore((state) => state.currentSave?.PlayerSave.data);

  if (!playerData) {
    return (
      <Card title="Business" subtitle="Load a save file to view business data">
        <p className="text-terminal-dim text-sm">
          No save file loaded. Upload a save file to view Corporation, Bladeburner, and Sleeves data.
        </p>
      </Card>
    );
  }

  const hasCorporation = playerData.corporation !== null;
  const hasBladeburner = playerData.bladeburner !== null;
  const sleeveCount = playerData.sleeves?.length ?? 0;

  const tabs = [
    {
      id: 'corporation',
      label: 'Corporation',
      content: (
        <Card title="Corporation" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {hasCorporation
              ? 'Corporation data exists in save file but requires schema implementation to edit.'
              : 'No corporation started. Corporation is an endgame feature unlocked in certain BitNodes.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Corporation is a complex nested structure with divisions, warehouses, products, and employees.
            Full editing support requires implementing detailed Zod schemas.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Corporation name, funds, revenue, expenses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Share data (total, owned, price, dividends)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Divisions with warehouses and products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Unlocks and upgrade levels</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'bladeburner',
      label: 'Bladeburner',
      content: (
        <Card title="Bladeburner" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {hasBladeburner
              ? 'Bladeburner data exists in save file but requires schema implementation to edit.'
              : 'Bladeburner not unlocked. Bladeburner is available in BitNode 6, 7, and with Source-File 6.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Bladeburner includes rank, skills, contracts, operations, black ops, and city data.
            Full editing support requires implementing detailed Zod schemas.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Rank, skill points, stamina</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Skills and their levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Contract/operation counts and levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Black ops completion, city chaos/population</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'sleeves',
      label: 'Sleeves',
      content: (
        <Card title="Sleeves" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {sleeveCount > 0
              ? `${sleeveCount} sleeve${sleeveCount !== 1 ? 's' : ''} in save file but requires schema implementation to edit.`
              : 'No sleeves available. Sleeves are unlocked in BitNode 10 or with Source-File 10.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Each sleeve has stats, multipliers, shock/sync values, augmentations, and current work.
            Full editing support requires implementing detailed Zod schemas.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Stats, exp, and multipliers per sleeve</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Shock, sync, and memory values</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Sleeve augmentations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Current work assignments</span>
            </li>
          </ul>
        </Card>
      ),
    },
  ];

  return (
    <Card
      title="Business"
      subtitle="Endgame systems"
    >
      <div className="space-y-6">
        {/* Business Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Corporation Status */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Corporation
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasCorporation ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasCorporation ? 'Active' : 'Not Started'}
                </span>
              </div>
            </div>
          </div>

          {/* Bladeburner Status */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Bladeburner
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasBladeburner ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasBladeburner ? 'Active' : 'Not Unlocked'}
                </span>
              </div>
            </div>
          </div>

          {/* Sleeves Status */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Sleeves
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Sleeves Owned:</span>
                <span className={sleeveCount > 0 ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {sleeveCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="corporation" />
      </div>
    </Card>
  );
}
