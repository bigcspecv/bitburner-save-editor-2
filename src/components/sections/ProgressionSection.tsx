import { useState, useMemo } from 'react';
import { Card, Tabs, NumberInput, Select, Button, ResetAction, Checkbox, Tooltip } from '../ui';
import { useSaveStore } from '../../store/save-store';
import {
  getAllBitNodeNumbers,
  getBitNodeMetadata,
  getDifficultyLabel,
  getDifficultyClass,
} from '../../models/bitnode-data';
import type { ChangeEvent } from 'react';

interface SourceFileCardProps {
  bitNodeNumber: number;
  level: number;
  maxLevel: number;
  isOwned: boolean;
  isModified: boolean;
  onLevelChange: (level: number) => void;
  onToggleOwned: (e: ChangeEvent<HTMLInputElement>) => void;
}

function SourceFileCard({
  bitNodeNumber,
  level,
  maxLevel,
  isOwned,
  isModified,
  onLevelChange,
  onToggleOwned,
}: SourceFileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const metadata = getBitNodeMetadata(bitNodeNumber);

  if (!metadata) return null;

  const effectiveMaxLevel = maxLevel === Infinity ? 999 : maxLevel;

  return (
    <div className="border border-terminal-primary/40 bg-terminal-dim/5 p-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Checkbox
              checked={isOwned}
              onChange={onToggleOwned}
              className="mr-1"
            />
            <h4 className={`text-sm font-bold uppercase tracking-wide ${isOwned ? 'text-terminal-secondary' : 'text-terminal-dim'}`}>
              SF{bitNodeNumber}
            </h4>
            {isOwned && (
              <span className="text-terminal-primary text-xs">
                Lv.{level}{maxLevel !== Infinity && `/${maxLevel}`}
              </span>
            )}
            {isModified && (
              <span className="text-terminal-secondary text-2xs border border-terminal-secondary/50 px-1">
                MODIFIED
              </span>
            )}
          </div>
          <p className={`text-2xs ${isOwned ? 'text-terminal-dim' : 'text-terminal-dim/50'}`}>
            {metadata.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content={getDifficultyLabel(metadata.difficulty)}>
            <span className={`text-xs ${getDifficultyClass(metadata.difficulty)}`}>
              {metadata.difficulty === 0 ? '[E]' : metadata.difficulty === 1 ? '[M]' : '[H]'}
            </span>
          </Tooltip>
          <Button
            variant="secondary"
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-2 py-1"
          >
            {expanded ? '[-]' : '[+]'}
          </Button>
        </div>
      </div>

      {/* Tagline */}
      <p className={`text-xs italic mb-2 ${isOwned ? 'text-terminal-secondary/70' : 'text-terminal-dim/50'}`}>
        "{metadata.tagline}"
      </p>

      {/* SF9 Warning - shown when owned */}
      {bitNodeNumber === 9 && isOwned && (
        <div className="border border-yellow-500/50 bg-yellow-500/10 p-2 mt-2 text-xs">
          <span className="text-yellow-400 font-bold">⚠ WARNING:</span>
          <span className="text-yellow-300 ml-1">
            Enabling SF9 converts Hacknet Nodes to Servers. Your existing Hacknet Nodes have been cleared.
          </span>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-terminal-primary/30 pt-3 mt-2 space-y-3">
          {isOwned && (
            <NumberInput
              label="Level"
              value={level}
              onChange={onLevelChange}
              min={1}
              max={effectiveMaxLevel}
              step={1}
            />
          )}

          <div className="space-y-2">
            <h5 className="text-terminal-secondary text-xs uppercase">BitNode Description</h5>
            <p className="text-terminal-dim text-xs leading-relaxed">
              {metadata.description}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-terminal-secondary text-xs uppercase">Source File Effect</h5>
            <p className="text-terminal-dim text-xs leading-relaxed">
              {metadata.sfDescription}
            </p>
          </div>

          {maxLevel !== Infinity && (
            <p className="text-terminal-dim text-2xs">
              Max Level: {maxLevel}
            </p>
          )}
          {maxLevel === Infinity && (
            <p className="text-terminal-secondary text-2xs">
              No maximum level - increases each time BN12 is destroyed
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BitNodeSourceFilesTab() {
  const currentSave = useSaveStore((state) => state.currentSave);
  const originalSave = useSaveStore((state) => state.originalSave);
  const updateSourceFileLevel = useSaveStore((state) => state.updateSourceFileLevel);
  const addSourceFile = useSaveStore((state) => state.addSourceFile);
  const removeSourceFile = useSaveStore((state) => state.removeSourceFile);
  const updateBitNodeN = useSaveStore((state) => state.updateBitNodeN);
  const resetSourceFiles = useSaveStore((state) => state.resetSourceFiles);
  const hasSourceFileChanges = useSaveStore((state) => state.hasSourceFileChanges);

  const [filter, setFilter] = useState<'all' | 'owned' | 'not-owned'>('all');
  const [showOnlyModified, setShowOnlyModified] = useState(false);

  const playerData = currentSave?.PlayerSave.data;
  const originalPlayerData = originalSave?.PlayerSave.data;

  if (!playerData || !originalPlayerData) {
    return (
      <div className="text-terminal-dim text-sm">
        No save file loaded.
      </div>
    );
  }

  // Convert sourceFiles JSONMap to a regular Map for easier access
  const sourceFilesMap = useMemo(() => {
    const map = new Map<number, number>();
    playerData.sourceFiles.data.forEach(([bn, level]) => {
      map.set(bn, level);
    });
    return map;
  }, [playerData.sourceFiles]);

  const originalSourceFilesMap = useMemo(() => {
    const map = new Map<number, number>();
    originalPlayerData.sourceFiles.data.forEach(([bn, level]) => {
      map.set(bn, level);
    });
    return map;
  }, [originalPlayerData.sourceFiles]);

  // Check if a source file has been modified
  const isSourceFileModified = (bn: number): boolean => {
    const currentLevel = sourceFilesMap.get(bn);
    const originalLevel = originalSourceFilesMap.get(bn);

    if (currentLevel === undefined && originalLevel === undefined) return false;
    if (currentLevel === undefined || originalLevel === undefined) return true;
    return currentLevel !== originalLevel;
  };

  // Filter source files based on current filter
  const allBitNodes = getAllBitNodeNumbers();
  const filteredBitNodes = useMemo(() => {
    return allBitNodes.filter((bn) => {
      const isOwned = sourceFilesMap.has(bn);

      // Apply ownership filter
      if (filter === 'owned' && !isOwned) return false;
      if (filter === 'not-owned' && isOwned) return false;

      // Apply modified filter
      if (showOnlyModified && !isSourceFileModified(bn)) return false;

      return true;
    });
  }, [allBitNodes, sourceFilesMap, filter, showOnlyModified]);

  // BitNode selection options
  const bitNodeOptions = allBitNodes.map((bn) => {
    const metadata = getBitNodeMetadata(bn);
    return {
      value: bn,
      label: `BN${bn}: ${metadata?.name ?? 'Unknown'}`,
    };
  });

  const handleToggleSourceFile = (bn: number) => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      addSourceFile(bn, 1);
    } else {
      removeSourceFile(bn);
    }
  };

  const handleLevelChange = (bn: number, level: number) => {
    updateSourceFileLevel(bn, level);
  };

  const isBitNodeModified = playerData.bitNodeN !== originalPlayerData.bitNodeN;

  return (
    <div className="space-y-6">
      {/* Current BitNode Selection */}
      <Card
        title="Current BitNode"
        subtitle={`BN${playerData.bitNodeN}`}
        actions={
          isBitNodeModified && (
            <span className="text-terminal-secondary text-xs border border-terminal-secondary/50 px-1">
              MODIFIED
            </span>
          )
        }
      >
        <div className="space-y-4">
          <Select
            label="Active BitNode"
            value={playerData.bitNodeN}
            onChange={(value) => updateBitNodeN(Number(value))}
            options={bitNodeOptions}
            showSearch={false}
          />
          {/* Warning when entering BN9 without SF9 */}
          {playerData.bitNodeN === 9 && !sourceFilesMap.has(9) && (
            <div className="border border-yellow-500/50 bg-yellow-500/10 p-2 text-xs">
              <span className="text-yellow-400 font-bold">⚠ WARNING:</span>
              <span className="text-yellow-300 ml-1">
                BitNode 9 uses Hacknet Servers instead of Nodes. Your Hacknet Nodes have been cleared.
              </span>
            </div>
          )}
          {getBitNodeMetadata(playerData.bitNodeN) && (
            <div className="space-y-2">
              <p className="text-terminal-secondary text-sm">
                {getBitNodeMetadata(playerData.bitNodeN)!.name}
              </p>
              <p className="text-terminal-dim text-xs italic">
                "{getBitNodeMetadata(playerData.bitNodeN)!.tagline}"
              </p>
              <p className="text-terminal-dim text-xs">
                {getBitNodeMetadata(playerData.bitNodeN)!.description}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Source Files */}
      <Card
        title="Source Files"
        subtitle={`${sourceFilesMap.size} owned`}
        actions={
          <ResetAction
            hasChanges={hasSourceFileChanges()}
            onReset={resetSourceFiles}
            title="Reset BitNode & Source Files"
          />
        }
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-terminal-dim/30">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
              className="text-xs px-3 py-1"
            >
              All ({allBitNodes.length})
            </Button>
            <Button
              variant={filter === 'owned' ? 'primary' : 'secondary'}
              onClick={() => setFilter('owned')}
              className="text-xs px-3 py-1"
            >
              Owned ({sourceFilesMap.size})
            </Button>
            <Button
              variant={filter === 'not-owned' ? 'primary' : 'secondary'}
              onClick={() => setFilter('not-owned')}
              className="text-xs px-3 py-1"
            >
              Not Owned ({allBitNodes.length - sourceFilesMap.size})
            </Button>
          </div>
          <Checkbox
            checked={showOnlyModified}
            onChange={(e) => setShowOnlyModified(e.target.checked)}
            label="Show only modified"
          />
        </div>

        {/* Source File Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBitNodes.map((bn) => {
            const metadata = getBitNodeMetadata(bn);
            if (!metadata) return null;

            const isOwned = sourceFilesMap.has(bn);
            const level = sourceFilesMap.get(bn) ?? 1;

            return (
              <SourceFileCard
                key={bn}
                bitNodeNumber={bn}
                level={level}
                maxLevel={metadata.maxLevel}
                isOwned={isOwned}
                isModified={isSourceFileModified(bn)}
                onLevelChange={(newLevel) => handleLevelChange(bn, newLevel)}
                onToggleOwned={handleToggleSourceFile(bn)}
              />
            );
          })}
        </div>

        {filteredBitNodes.length === 0 && (
          <p className="text-terminal-dim text-sm text-center py-4">
            No source files match the current filters.
          </p>
        )}
      </Card>
    </div>
  );
}

export function ProgressionSection() {
  const playerData = useSaveStore((state) => state.currentSave?.PlayerSave.data);
  const hasSourceFileChanges = useSaveStore((state) => state.hasSourceFileChanges);

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
  const sourceFileCount = playerData.sourceFiles?.data?.length ?? 0;
  const exploitCount = playerData.exploits?.length ?? 0;
  const totalPlaytimeHours = Math.floor((playerData.totalPlaytime ?? 0) / 3600000);

  const tabs = [
    {
      id: 'bitnode',
      label: 'BitNode & Source Files',
      content: <BitNodeSourceFilesTab />,
      hasChanges: hasSourceFileChanges(),
    },
    {
      id: 'exploits',
      label: 'Exploits',
      notImplemented: true,
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
      notImplemented: true,
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
              {getBitNodeMetadata(currentBitNode) && (
                <div className="text-terminal-dim text-xs">
                  {getBitNodeMetadata(currentBitNode)!.name}
                </div>
              )}
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
