import { Card, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function ProgressionSection() {
  const playerData = useSaveStore((state) => state.currentSave?.PlayerSave.data);

  if (!playerData) {
    return (
      <Card title="Progression" subtitle="Load a save file to view progression data">
        <p className="text-terminal-dim text-sm">
          No save file loaded. Upload a save file to view BitNode, source files, exploits, and playtime stats.
        </p>
      </Card>
    );
  }

  const currentBitNode = playerData.bitNodeN;
  const sourceFileCount = playerData.sourceFiles?.size ?? 0;
  const exploitCount = playerData.exploits?.length ?? 0;
  const totalPlaytimeHours = Math.floor((playerData.totalPlaytime ?? 0) / 3600000);

  const tabs = [
    {
      id: 'bitnode',
      label: 'BitNode & Source Files',
      content: (
        <Card title="BitNode & Source Files" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">View and edit BitNode progression and source file levels.</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View current BitNode number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Edit source file levels (SF1-SF14)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Add/remove source files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View BitNode options and overrides</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'exploits',
      label: 'Exploits',
      content: (
        <Card title="Exploits" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">View and manage discovered exploits.</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View all discovered exploits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Add/remove exploits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View exploit-based multiplier bonuses</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'playtime',
      label: 'Playtime Stats',
      content: (
        <Card title="Playtime Stats" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">View and edit playtime tracking data.</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View total playtime</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View time since last augmentation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View time since last BitNode reset</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View last save/update timestamps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>View achievements</span>
            </li>
          </ul>
        </Card>
      ),
    },
  ];

  return (
    <Card
      title="Progression"
      subtitle={`BitNode ${currentBitNode}`}
    >
      <div className="space-y-6">
        {/* Progression Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* BitNode Info */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; BitNode
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Current BitNode:</span>
                <span className="text-terminal-primary">BN{currentBitNode}</span>
              </div>
            </div>
          </div>

          {/* Source Files */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Source Files
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Source Files Owned:</span>
                <span className="text-terminal-primary">{sourceFileCount}</span>
              </div>
            </div>
          </div>

          {/* Exploits */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Exploits
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Exploits Found:</span>
                <span className="text-terminal-primary">{exploitCount}</span>
              </div>
            </div>
          </div>

          {/* Playtime */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Playtime
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Total Playtime:</span>
                <span className="text-terminal-primary">{totalPlaytimeHours}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="bitnode" />
      </div>
    </Card>
  );
}
