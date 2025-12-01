import { useState, useMemo, useEffect } from 'react';
import { Card, Tabs, Button, NumberInput, ResetAction, Modal, Input, Checkbox } from '../ui';
import { useSaveStore } from '../../store/save-store';
import type { HacknetNode } from '../../models/schemas/player';

// Hacknet Node Constants from Bitburner source
const HACKNET_NODE_MAX_LEVEL = 200;
const HACKNET_NODE_MAX_RAM = 64;
const HACKNET_NODE_MAX_CORES = 16;

// RAM options for hacknet nodes (powers of 2 from 1 to 64)
const RAM_OPTIONS = [1, 2, 4, 8, 16, 32, 64];

function formatMoney(amount: number): string {
  if (amount === 0) return '$0';
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}t`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}b`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}m`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}k`;
  return `$${amount.toFixed(2)}`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

interface HacknetNodeCardProps {
  node: HacknetNode;
  index: number;
  isModified: boolean;
  onUpdate: (index: number, updates: Partial<HacknetNode['data']>) => void;
  onRemove: (index: number) => void;
}

function HacknetNodeCard({ node, index, isModified, onUpdate, onRemove }: HacknetNodeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const data = node.data;

  const handleUpdate = <K extends keyof HacknetNode['data']>(field: K) => (value: HacknetNode['data'][K]) => {
    onUpdate(index, { [field]: value });
  };

  // Extract node number from name (e.g., "hacknet-node-5" -> 5)
  const nodeNumber = data.name.replace('hacknet-node-', '');

  return (
    <div className="border border-terminal-primary/40 bg-terminal-dim/5 p-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-terminal-secondary uppercase tracking-wide text-sm font-bold">
              Node {nodeNumber}
            </h4>
            {isModified && (
              <span className="text-terminal-secondary text-2xs border border-terminal-secondary/50 px-1">
                MODIFIED
              </span>
            )}
          </div>
          <p className="text-terminal-dim text-2xs">{data.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setExpanded(!expanded)} className="text-xs px-2 py-1">
            {expanded ? '[-]' : '[+]'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onRemove(index)}
            className="text-xs px-2 py-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
          >
            DELETE
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
        <div>
          <span className="text-terminal-dim">Level:</span>{' '}
          <span className="text-terminal-primary">{data.level}/{HACKNET_NODE_MAX_LEVEL}</span>
        </div>
        <div>
          <span className="text-terminal-dim">RAM:</span>{' '}
          <span className="text-terminal-primary">{data.ram} GB</span>
        </div>
        <div>
          <span className="text-terminal-dim">Cores:</span>{' '}
          <span className="text-terminal-primary">{data.cores}</span>
        </div>
      </div>

      {/* Production Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-terminal-dim">Total Earned:</span>{' '}
          <span className="text-terminal-primary">{formatMoney(data.totalMoneyGenerated)}</span>
        </div>
        <div>
          <span className="text-terminal-dim">Online:</span>{' '}
          <span className="text-terminal-primary">{formatTime(data.onlineTimeSeconds)}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-terminal-primary/30 pt-3 mt-2 space-y-3">
          <NumberInput
            label="Level"
            value={data.level}
            onChange={handleUpdate('level')}
            min={1}
            max={HACKNET_NODE_MAX_LEVEL}
            step={1}
          />
          <p className="text-terminal-dim text-xs -mt-2">
            Higher levels increase money production rate. Max: {HACKNET_NODE_MAX_LEVEL}
          </p>

          <NumberInput
            label="RAM (GB)"
            value={data.ram}
            onChange={handleUpdate('ram')}
            min={1}
            max={HACKNET_NODE_MAX_RAM}
            step={1}
          />
          <p className="text-terminal-dim text-xs -mt-2">
            Must be a power of 2 (1, 2, 4, 8, 16, 32, 64). Max: {HACKNET_NODE_MAX_RAM} GB
          </p>
          {!RAM_OPTIONS.includes(data.ram) && (
            <p className="text-red-500 text-xs">
              Warning: RAM should be a power of 2. Current value ({data.ram}) may cause issues.
            </p>
          )}

          <NumberInput
            label="Cores"
            value={data.cores}
            onChange={handleUpdate('cores')}
            min={1}
            max={HACKNET_NODE_MAX_CORES}
            step={1}
          />
          <p className="text-terminal-dim text-xs -mt-2">
            More cores increase money production rate. Max: {HACKNET_NODE_MAX_CORES}
          </p>

          <div className="border-t border-terminal-primary/20 pt-3 mt-3">
            <h5 className="text-terminal-secondary text-xs uppercase mb-2">Statistics</h5>
            <NumberInput
              label="Total Money Generated ($)"
              value={data.totalMoneyGenerated}
              onChange={handleUpdate('totalMoneyGenerated')}
              min={0}
              showButtons={false}
            />
            <NumberInput
              label="Online Time (seconds)"
              value={data.onlineTimeSeconds}
              onChange={handleUpdate('onlineTimeSeconds')}
              min={0}
              showButtons={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface AddHacknetNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, level: number, ram: number, cores: number) => void;
  existingCount: number;
}

function AddHacknetNodeModal({ isOpen, onClose, onAdd, existingCount }: AddHacknetNodeModalProps) {
  const [level, setLevel] = useState(1);
  const [ram, setRam] = useState(1);
  const [cores, setCores] = useState(1);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLevel(1);
      setRam(1);
      setCores(1);
      setError('');
    }
  }, [isOpen]);

  const handleAdd = () => {
    setError('');

    if (!RAM_OPTIONS.includes(ram)) {
      setError('RAM must be a power of 2 (1, 2, 4, 8, 16, 32, or 64)');
      return;
    }

    // Generate name based on existing count
    const name = `hacknet-node-${existingCount}`;
    onAdd(name, level, ram, cores);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Hacknet Node"
    >
      <div className="space-y-4">
        <div className="text-terminal-dim text-sm mb-2">
          <p>New node will be named: <span className="text-terminal-primary">hacknet-node-{existingCount}</span></p>
        </div>

        <NumberInput
          label="Level"
          value={level}
          onChange={setLevel}
          min={1}
          max={HACKNET_NODE_MAX_LEVEL}
          step={1}
        />

        <NumberInput
          label="RAM (GB)"
          value={ram}
          onChange={setRam}
          min={1}
          max={HACKNET_NODE_MAX_RAM}
          step={1}
        />
        <p className="text-terminal-dim text-xs -mt-2">
          Valid values: 1, 2, 4, 8, 16, 32, 64
        </p>

        <NumberInput
          label="Cores"
          value={cores}
          onChange={setCores}
          min={1}
          max={HACKNET_NODE_MAX_CORES}
          step={1}
        />

        {error && <p className="text-red-500 text-sm">&gt; ERROR: {error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>
            Add Node
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface AddMaxNodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (count: number, level: number, ram: number, cores: number) => void;
  existingCount: number;
}

function AddMaxNodesModal({ isOpen, onClose, onAdd, existingCount }: AddMaxNodesModalProps) {
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState(HACKNET_NODE_MAX_LEVEL);
  const [ram, setRam] = useState(HACKNET_NODE_MAX_RAM);
  const [cores, setCores] = useState(HACKNET_NODE_MAX_CORES);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCount(10);
      setLevel(HACKNET_NODE_MAX_LEVEL);
      setRam(HACKNET_NODE_MAX_RAM);
      setCores(HACKNET_NODE_MAX_CORES);
      setError('');
    }
  }, [isOpen]);

  const handleAdd = () => {
    setError('');

    if (!RAM_OPTIONS.includes(ram)) {
      setError('RAM must be a power of 2 (1, 2, 4, 8, 16, 32, or 64)');
      return;
    }

    if (count < 1) {
      setError('Must add at least 1 node');
      return;
    }

    onAdd(count, level, ram, cores);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Multiple Hacknet Nodes"
    >
      <div className="space-y-4">
        <div className="text-terminal-dim text-sm mb-2">
          <p>Nodes will be named hacknet-node-{existingCount} through hacknet-node-{existingCount + count - 1}</p>
        </div>

        <NumberInput
          label="Number of Nodes"
          value={count}
          onChange={setCount}
          min={1}
          max={100}
          step={1}
        />

        <NumberInput
          label="Level"
          value={level}
          onChange={setLevel}
          min={1}
          max={HACKNET_NODE_MAX_LEVEL}
          step={1}
        />

        <NumberInput
          label="RAM (GB)"
          value={ram}
          onChange={setRam}
          min={1}
          max={HACKNET_NODE_MAX_RAM}
          step={1}
        />
        <p className="text-terminal-dim text-xs -mt-2">
          Valid values: 1, 2, 4, 8, 16, 32, 64
        </p>

        <NumberInput
          label="Cores"
          value={cores}
          onChange={setCores}
          min={1}
          max={HACKNET_NODE_MAX_CORES}
          step={1}
        />

        {error && <p className="text-red-500 text-sm">&gt; ERROR: {error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>
            Add {count} Node{count !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface ModifyAllNodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModify: (level: number, ram: number, cores: number) => void;
  nodeCount: number;
}

function ModifyAllNodesModal({ isOpen, onClose, onModify, nodeCount }: ModifyAllNodesModalProps) {
  const [level, setLevel] = useState(HACKNET_NODE_MAX_LEVEL);
  const [ram, setRam] = useState(HACKNET_NODE_MAX_RAM);
  const [cores, setCores] = useState(HACKNET_NODE_MAX_CORES);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLevel(HACKNET_NODE_MAX_LEVEL);
      setRam(HACKNET_NODE_MAX_RAM);
      setCores(HACKNET_NODE_MAX_CORES);
      setError('');
    }
  }, [isOpen]);

  const handleModify = () => {
    setError('');

    if (!RAM_OPTIONS.includes(ram)) {
      setError('RAM must be a power of 2 (1, 2, 4, 8, 16, 32, or 64)');
      return;
    }

    onModify(level, ram, cores);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modify All Hacknet Nodes"
    >
      <div className="space-y-4">
        <div className="text-terminal-dim text-sm mb-2">
          <p>This will update level, RAM, and cores for all {nodeCount} node{nodeCount !== 1 ? 's' : ''}.</p>
        </div>

        <NumberInput
          label="Level"
          value={level}
          onChange={setLevel}
          min={1}
          max={HACKNET_NODE_MAX_LEVEL}
          step={1}
        />

        <NumberInput
          label="RAM (GB)"
          value={ram}
          onChange={setRam}
          min={1}
          max={HACKNET_NODE_MAX_RAM}
          step={1}
        />
        <p className="text-terminal-dim text-xs -mt-2">
          Valid values: 1, 2, 4, 8, 16, 32, 64
        </p>

        <NumberInput
          label="Cores"
          value={cores}
          onChange={setCores}
          min={1}
          max={HACKNET_NODE_MAX_CORES}
          step={1}
        />

        {error && <p className="text-red-500 text-sm">&gt; ERROR: {error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleModify} disabled={nodeCount === 0}>
            Modify {nodeCount} Node{nodeCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function HacknetSection() {
  const hacknetNodes = useSaveStore((state) => state.currentSave?.PlayerSave.data.hacknetNodes);
  const originalHacknetNodes = useSaveStore((state) => state.originalSave?.PlayerSave.data.hacknetNodes);
  const hashManager = useSaveStore((state) => state.currentSave?.PlayerSave.data.hashManager);
  const updateHacknetNode = useSaveStore((state) => state.updateHacknetNode);
  const addHacknetNode = useSaveStore((state) => state.addHacknetNode);
  const removeHacknetNode = useSaveStore((state) => state.removeHacknetNode);
  const resetHacknetNodes = useSaveStore((state) => state.resetHacknetNodes);
  const hasHacknetNodeChanges = useSaveStore((state) => state.hasHacknetNodeChanges());

  const [search, setSearch] = useState('');
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMaxModal, setShowAddMaxModal] = useState(false);
  const [showModifyAllModal, setShowModifyAllModal] = useState(false);

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

  // Filter nodes
  const filteredNodes = useMemo(() => {
    if (!hacknetNodes) return [];

    return hacknetNodes.filter((node, index) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!node.data.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Modified only filter
      if (showModifiedOnly && originalHacknetNodes) {
        const originalNode = originalHacknetNodes[index];
        if (originalNode && JSON.stringify(originalNode) === JSON.stringify(node)) {
          return false;
        }
      }

      return true;
    });
  }, [hacknetNodes, originalHacknetNodes, search, showModifiedOnly]);

  const isNodeModified = (index: number): boolean => {
    if (!originalHacknetNodes || !hacknetNodes) return false;
    const originalNode = originalHacknetNodes[index];
    const currentNode = hacknetNodes[index];
    if (!originalNode || !currentNode) return true; // New node
    return JSON.stringify(originalNode) !== JSON.stringify(currentNode);
  };

  const handleAddMultipleNodes = (count: number, level: number, ram: number, cores: number) => {
    const startIndex = hacknetNodes?.length ?? 0;
    for (let i = 0; i < count; i++) {
      addHacknetNode(`hacknet-node-${startIndex + i}`, level, ram, cores);
    }
  };

  const handleModifyAll = (level: number, ram: number, cores: number) => {
    if (!hacknetNodes) return;
    hacknetNodes.forEach((_, index) => {
      updateHacknetNode(index, { level, ram, cores });
    });
  };

  const handleDeleteAll = () => {
    if (!hacknetNodes) return;
    // Remove from end to avoid index shifting issues
    for (let i = hacknetNodes.length - 1; i >= 0; i--) {
      removeHacknetNode(i);
    }
  };

  const tabs = [
    {
      id: 'nodes',
      label: 'Nodes',
      hasChanges: hasHacknetNodeChanges,
      content: (
        <Card
          title="Hacknet Nodes"
          subtitle={`${filteredNodes.length} of ${nodeCount} nodes shown`}
          actions={
            <div className="flex gap-2 items-center flex-wrap">
              <Button onClick={() => setShowAddModal(true)} className="text-xs px-2 py-1">
                + ADD NODE
              </Button>
              <Button onClick={() => setShowAddMaxModal(true)} className="text-xs px-2 py-1">
                + ADD MULTIPLE
              </Button>
              {nodeCount > 0 && (
                <>
                  <Button onClick={() => setShowModifyAllModal(true)} className="text-xs px-2 py-1">
                    MODIFY ALL
                  </Button>
                  <Button
                    onClick={handleDeleteAll}
                    variant="danger"
                    className="text-xs px-2 py-1"
                  >
                    DELETE ALL
                  </Button>
                </>
              )}
              <ResetAction
                title="Reset Hacknet Nodes"
                hasChanges={hasHacknetNodeChanges}
                onReset={resetHacknetNodes}
              />
            </div>
          }
        >
          {/* Filters */}
          <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3 mb-4">
            <h3 className="text-terminal-secondary uppercase text-sm mb-3">Filters</h3>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by node name..."
              className="mb-3"
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Checkbox checked={showModifiedOnly} onChange={(e) => setShowModifiedOnly(e.target.checked)} />
                <span className="text-terminal-primary text-sm">Modified Only</span>
              </label>

              {(search || showModifiedOnly) && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setShowModifiedOnly(false);
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Node List */}
          {filteredNodes.length === 0 ? (
            nodeCount === 0 ? (
              <div className="text-center py-8">
                <p className="text-terminal-dim text-sm mb-4">No Hacknet nodes yet.</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowAddModal(true)}>Add Your First Node</Button>
                  <Button onClick={() => setShowAddMaxModal(true)}>Add Multiple Nodes</Button>
                </div>
              </div>
            ) : (
              <p className="text-terminal-dim text-sm">No nodes match the current filters.</p>
            )
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNodes.map((node, filteredIndex) => {
                // Find the actual index in the original array
                const actualIndex = hacknetNodes?.findIndex(n => n.data.name === node.data.name) ?? filteredIndex;
                return (
                  <HacknetNodeCard
                    key={node.data.name}
                    node={node}
                    index={actualIndex}
                    isModified={isNodeModified(actualIndex)}
                    onUpdate={updateHacknetNode}
                    onRemove={removeHacknetNode}
                  />
                );
              })}
            </div>
          )}
        </Card>
      ),
    },
    {
      id: 'hash-manager',
      label: 'Hash Manager',
      notImplemented: true,
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
    <>
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
                  <span className="text-terminal-primary">{formatMoney(totalMoneyGenerated)}</span>
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

            {/* Info */}
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

      {/* Modals */}
      <AddHacknetNodeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addHacknetNode}
        existingCount={nodeCount}
      />

      <AddMaxNodesModal
        isOpen={showAddMaxModal}
        onClose={() => setShowAddMaxModal(false)}
        onAdd={handleAddMultipleNodes}
        existingCount={nodeCount}
      />

      <ModifyAllNodesModal
        isOpen={showModifyAllModal}
        onClose={() => setShowModifyAllModal(false)}
        onModify={handleModifyAll}
        nodeCount={nodeCount}
      />
    </>
  );
}
