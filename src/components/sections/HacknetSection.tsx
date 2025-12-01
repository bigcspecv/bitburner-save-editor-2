import { Card, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function HacknetSection() {
  const hacknetNodes = useSaveStore((state) => state.currentSave?.PlayerSave.data.hacknetNodes);
  const hashManager = useSaveStore((state) => state.currentSave?.PlayerSave.data.hashManager);

  if (!hacknetNodes && !hashManager) {
    return (
      <Card title="Hacknet" subtitle="Load a save file to edit Hacknet data">
        <p className="text-terminal-dim text-sm">
          No save file loaded. Upload a save file to view and edit Hacknet nodes and hash manager.
        </p>
      </Card>
    );
  }

  const nodeCount = hacknetNodes?.length ?? 0;
  const totalMoneyGenerated = hacknetNodes?.reduce((sum, node) => sum + node.data.totalMoneyGenerated, 0) ?? 0;
  const currentHashes = hashManager?.data.hashes ?? 0;
  const hashCapacity = hashManager?.data.capacity ?? 0;
  const upgradeCount = Object.keys(hashManager?.data.upgrades ?? {}).length;

  const tabs = [
    {
      id: 'nodes',
      label: 'Nodes',
      content: (
        <Card title="Hacknet Nodes" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">Manage your Hacknet nodes and their upgrades.</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Add/remove Hacknet nodes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Edit node levels, RAM, and cores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View total money generated per node</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View production rates</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'hash-manager',
      label: 'Hash Manager',
      content: (
        <Card title="Hash Manager" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">Manage hashes and hash upgrades (Hacknet Servers).</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Edit current hash amount</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Edit hash capacity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View and edit purchased hash upgrades</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Reset upgrade counts</span>
            </li>
          </ul>
        </Card>
      ),
    },
  ];

  return (
    <Card
      title="Hacknet"
      subtitle={`${nodeCount} node${nodeCount !== 1 ? 's' : ''}`}
    >
      <div className="space-y-6">
        {/* Hacknet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Node Stats */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Node Stats
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Total Nodes:</span>
                <span className="text-terminal-primary">{nodeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-dim">Total Money Generated:</span>
                <span className="text-terminal-primary">${totalMoneyGenerated.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Hash Manager Stats */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Hash Manager
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Current Hashes:</span>
                <span className="text-terminal-primary">{currentHashes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-dim">Hash Capacity:</span>
                <span className="text-terminal-primary">{hashCapacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-dim">Upgrades Purchased:</span>
                <span className="text-terminal-primary">{upgradeCount}</span>
              </div>
            </div>
          </div>

          {/* Placeholder for additional info */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Info
            </h3>
            <p className="text-terminal-dim text-sm">
              Hacknet nodes generate passive income. Hacknet servers (BitNode 9+) generate hashes that can be spent on upgrades.
            </p>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="nodes" />
      </div>
    </Card>
  );
}
