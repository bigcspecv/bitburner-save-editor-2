import { useState, useMemo, useEffect } from 'react';
import { Card, Input, Checkbox, Button, NumberInput, ResetAction, Tabs, Modal, Select, type SelectOption } from '../ui';
import { useSaveStore } from '../../store/save-store';
import type { Server } from '../../models/types';

const PURCHASED_SERVER_MAX_RAM = 1048576; // 2^20 GB
const MAX_PURCHASED_SERVERS = 25;

// Generate RAM options as powers of 2
function generateRamOptions(minPower: number, maxPower: number): SelectOption[] {
  const options: SelectOption[] = [];
  for (let power = minPower; power <= maxPower; power++) {
    const ram = Math.pow(2, power);
    options.push({
      value: ram,
      label: `${ram} GB (2^${power})`,
    });
  }
  return options;
}

const HOME_RAM_OPTIONS = generateRamOptions(0, 30); // 1 GB to 1,073,741,824 GB
const PURCHASED_RAM_OPTIONS = generateRamOptions(0, 20); // 1 GB to 1,048,576 GB

// Format RAM value (already in GB) for display
function formatRam(ramGB: number): string {
  if (ramGB === 0) return '0 GB';
  if (ramGB >= 1024) return `${(ramGB / 1024).toFixed(0)} TB`;
  return `${ramGB} GB`;
}

function formatMoney(amount: number | undefined): string {
  if (amount === undefined) return 'N/A';
  if (amount === 0) return '$0';
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}t`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}b`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}m`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}k`;
  return `$${amount.toFixed(2)}`;
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

interface HomeServerCardProps {
  server: Server;
  onUpdate: (hostname: string, updates: Partial<Server['data']>) => void;
  hasChanges: boolean;
  onReset: () => void;
}

function HomeServerCard({ server, onUpdate, hasChanges, onReset }: HomeServerCardProps) {
  const data = server.data;

  const handleUpdate = (field: keyof Server['data']) => (value: number | boolean) => {
    onUpdate(data.hostname, { [field]: value });
  };

  return (
    <Card
      title="Home Server"
      subtitle={`Your personal computer`}
      actions={
        <ResetAction
          title="Reset Home Server"
          hasChanges={hasChanges}
          onReset={onReset}
        />
      }
    >
      <div className="space-y-4">
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-terminal-dim">Hostname:</span>{' '}
            <span className="text-terminal-primary">{data.hostname}</span>
          </div>
          <div>
            <span className="text-terminal-dim">IP:</span>{' '}
            <span className="text-terminal-primary">{data.ip}</span>
          </div>
          <div>
            <span className="text-terminal-dim">CPU Cores:</span>{' '}
            <span className="text-terminal-primary">{data.cpuCores}</span>
          </div>
          <div>
            <span className="text-terminal-dim">Files:</span>{' '}
            <span className="text-terminal-primary">
              {Object.keys(data.scripts).length} scripts, {data.programs.length} programs
            </span>
          </div>
        </div>

        {/* Hardware Configuration */}
        <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
          <h4 className="text-terminal-secondary uppercase text-sm mb-3">Hardware Configuration</h4>
          <div className="space-y-3">
            <Select
              label="Max RAM"
              options={HOME_RAM_OPTIONS}
              value={data.maxRam}
              onChange={(value) => handleUpdate('maxRam')(Number(value))}
              showSearch={false}
            />
            {!isPowerOfTwo(data.maxRam) && (
              <p className="text-red-500 text-xs -mt-2">
                Warning: Current RAM ({data.maxRam} GB) is not a power of 2. This may cause issues.
              </p>
            )}
            <NumberInput
              label="CPU Cores"
              value={data.cpuCores}
              onChange={handleUpdate('cpuCores')}
              min={1}
              max={8}
              step={1}
              showButtons={false}
            />
            {data.cpuCores > 8 && (
              <p className="text-yellow-500 text-xs -mt-2">
                Warning: Home server has a maximum of 8 cores in the game. Values above 8 may cause issues.
              </p>
            )}
            <p className="text-terminal-dim text-xs -mt-2">
              Cores increase the effectiveness of grow() and weaken() operations on 'home'.
            </p>
          </div>
        </div>

      </div>
    </Card>
  );
}

interface PurchasedServerCardProps {
  server: Server;
  isModified: boolean;
  onUpdate: (hostname: string, updates: Partial<Server['data']>) => void;
  onReset: (hostname: string) => void;
  onRemove: (hostname: string) => void;
}

function PurchasedServerCard({ server, isModified, onUpdate, onReset, onRemove }: PurchasedServerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const data = server.data;

  const handleUpdate = (field: keyof Server['data']) => (value: number | boolean) => {
    onUpdate(data.hostname, { [field]: value });
  };

  return (
    <div className="border border-terminal-primary/40 bg-terminal-dim/5 p-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-terminal-secondary uppercase tracking-wide text-sm font-bold">{data.hostname}</h4>
            {isModified && (
              <span className="text-terminal-secondary text-2xs border border-terminal-secondary/50 px-1">
                MODIFIED
              </span>
            )}
          </div>
          <p className="text-terminal-dim text-2xs">IP: {data.ip}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setExpanded(!expanded)} className="text-xs px-2 py-1">
            {expanded ? '[-]' : '[+]'}
          </Button>
          {isModified && (
            <Button variant="secondary" onClick={() => onReset(data.hostname)} className="text-xs px-2 py-1">
              RESET
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => onRemove(data.hostname)}
            className="text-xs px-2 py-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
          >
            DELETE
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <span className="text-terminal-dim">RAM:</span>{' '}
          <span className="text-terminal-primary">{formatRam(data.maxRam)}</span>
        </div>
        <div>
          <span className="text-terminal-dim">Cores:</span>{' '}
          <span className="text-terminal-primary">{data.cpuCores}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-terminal-primary/30 pt-3 mt-2 space-y-3">
          <Select
            label="Max RAM"
            options={PURCHASED_RAM_OPTIONS}
            value={data.maxRam}
            onChange={(value) => handleUpdate('maxRam')(Number(value))}
            showSearch={false}
          />
          {!isPowerOfTwo(data.maxRam) && (
            <p className="text-red-500 text-xs">
              Warning: Current RAM ({data.maxRam} GB) is not a power of 2. This may cause issues.
            </p>
          )}
          <NumberInput
            label="CPU Cores"
            value={data.cpuCores}
            onChange={handleUpdate('cpuCores')}
            min={1}
            max={8}
            step={1}
            showButtons={false}
          />
          <p className="text-terminal-dim text-xs -mt-2">
            Cores increase the effectiveness of grow() and weaken() operations.
          </p>
        </div>
      )}
    </div>
  );
}

interface NetworkServerCardProps {
  server: Server;
  isModified: boolean;
  onUpdate: (hostname: string, updates: Partial<Server['data']>) => void;
  onReset: (hostname: string) => void;
}

function NetworkServerCard({ server, isModified, onUpdate, onReset }: NetworkServerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const data = server.data;

  const handleUpdate = (field: keyof Server['data']) => (value: number | boolean) => {
    onUpdate(data.hostname, { [field]: value });
  };

  const numOpenPorts = [
    data.ftpPortOpen,
    data.httpPortOpen,
    data.smtpPortOpen,
    data.sqlPortOpen,
    data.sshPortOpen,
  ].filter(Boolean).length;

  return (
    <div className="border border-terminal-primary/40 bg-terminal-dim/5 p-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-terminal-secondary uppercase tracking-wide text-sm font-bold">{data.hostname}</h4>
            {isModified && (
              <span className="text-terminal-secondary text-2xs border border-terminal-secondary/50 px-1">
                MODIFIED
              </span>
            )}
          </div>
          <p className="text-terminal-dim text-xs">{data.organizationName}</p>
          <p className="text-terminal-dim text-2xs">IP: {data.ip}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setExpanded(!expanded)} className="text-xs px-2 py-1">
            {expanded ? '[-]' : '[+]'}
          </Button>
          {isModified && (
            <Button variant="secondary" onClick={() => onReset(data.hostname)} className="text-xs px-2 py-1">
              RESET
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <span className="text-terminal-dim">RAM:</span>{' '}
          <span className="text-terminal-primary">{formatRam(data.maxRam)}</span>
        </div>
        {data.moneyAvailable !== undefined && (
          <>
            <div>
              <span className="text-terminal-dim">Money:</span>{' '}
              <span className="text-terminal-primary">{formatMoney(data.moneyAvailable)}</span>
            </div>
            <div>
              <span className="text-terminal-dim">Max $:</span>{' '}
              <span className="text-terminal-primary">{formatMoney(data.moneyMax)}</span>
            </div>
          </>
        )}
        {data.hackDifficulty !== undefined && (
          <div>
            <span className="text-terminal-dim">Security:</span>{' '}
            <span className="text-terminal-primary">{data.hackDifficulty.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between gap-2 text-2xs mb-2">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1">
            <Checkbox checked={data.hasAdminRights} onChange={(e) => handleUpdate('hasAdminRights')(e.target.checked)} />
            <span className="text-terminal-primary uppercase">Root</span>
          </label>
          <label className="flex items-center gap-1">
            <Checkbox checked={data.backdoorInstalled ?? false} onChange={(e) => handleUpdate('backdoorInstalled')(e.target.checked)} />
            <span className="text-terminal-secondary uppercase">Backdoor</span>
          </label>
        </div>
        <span className="text-terminal-dim border border-terminal-dim/50 px-1">
          PORTS: {numOpenPorts}/{data.numOpenPortsRequired ?? 0}
        </span>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-terminal-primary/30 pt-3 mt-2 space-y-3">
          <Select
            label="RAM"
            options={PURCHASED_RAM_OPTIONS}
            value={data.maxRam}
            onChange={(value) => handleUpdate('maxRam')(Number(value))}
            showSearch={false}
          />
          {!isPowerOfTwo(data.maxRam) && (
            <p className="text-red-500 text-xs">
              Warning: Current RAM ({data.maxRam} GB) is not a power of 2. This may cause issues.
            </p>
          )}

          {data.moneyAvailable !== undefined && (
            <>
              <NumberInput
                label="Money Available ($)"
                value={data.moneyAvailable}
                onChange={handleUpdate('moneyAvailable')}
                min={0}
                showButtons={false}
              />
              <NumberInput
                label="Max Money ($)"
                value={data.moneyMax ?? 0}
                onChange={handleUpdate('moneyMax')}
                min={0}
                showButtons={false}
              />
            </>
          )}

          {data.hackDifficulty !== undefined && (
            <>
              <NumberInput
                label="Security Level"
                value={data.hackDifficulty}
                onChange={handleUpdate('hackDifficulty')}
                min={data.minDifficulty ?? 1}
                step={0.01}
                showButtons={false}
              />
              <NumberInput
                label="Min Security"
                value={data.minDifficulty ?? 1}
                onChange={handleUpdate('minDifficulty')}
                min={1}
                max={data.hackDifficulty}
                step={0.01}
                showButtons={false}
              />
              {data.minDifficulty !== undefined && data.minDifficulty > data.hackDifficulty && (
                <p className="text-red-500 text-xs">
                  Warning: Min Security ({data.minDifficulty.toFixed(2)}) cannot be greater than Security Level ({data.hackDifficulty.toFixed(2)}). This will crash the game!
                </p>
              )}
              <NumberInput
                label="Base Security"
                value={data.baseDifficulty ?? 1}
                onChange={handleUpdate('baseDifficulty')}
                min={1}
                step={0.01}
                showButtons={false}
              />
              <p className="text-terminal-dim text-xs -mt-2">
                Higher values provide more hacking experience when hacking this server. Does not affect difficulty.
              </p>
              <NumberInput
                label="Growth Rate"
                value={data.serverGrowth ?? 1}
                onChange={handleUpdate('serverGrowth')}
                min={0}
                step={1}
                showButtons={false}
              />
              <p className="text-terminal-dim text-xs -mt-2">
                How quickly the server's money can grow. Higher values make it easier to increase money with grow().
              </p>
              <NumberInput
                label="Required Hacking Skill"
                value={data.requiredHackingSkill ?? 1}
                onChange={handleUpdate('requiredHackingSkill')}
                min={1}
                step={1}
                showButtons={false}
              />
              <NumberInput
                label="Ports Required"
                value={data.numOpenPortsRequired ?? 0}
                onChange={handleUpdate('numOpenPortsRequired')}
                min={0}
                max={5}
                step={1}
                showButtons={false}
              />
            </>
          )}

          <div className="border border-terminal-primary/30 p-2">
            <h5 className="text-terminal-secondary text-xs uppercase mb-2">Open Ports</h5>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={data.ftpPortOpen} onChange={(e) => handleUpdate('ftpPortOpen')(e.target.checked)} />
                <span className="text-terminal-primary text-sm">FTP Port (21)</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={data.httpPortOpen} onChange={(e) => handleUpdate('httpPortOpen')(e.target.checked)} />
                <span className="text-terminal-primary text-sm">HTTP Port (80)</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={data.smtpPortOpen ?? false}
                  onChange={(e) => handleUpdate('smtpPortOpen')(e.target.checked)}
                />
                <span className="text-terminal-primary text-sm">SMTP Port (25)</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={data.sqlPortOpen ?? false}
                  onChange={(e) => handleUpdate('sqlPortOpen')(e.target.checked)}
                />
                <span className="text-terminal-primary text-sm">SQL Port (3306)</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={data.sshPortOpen ?? false}
                  onChange={(e) => handleUpdate('sshPortOpen')(e.target.checked)}
                />
                <span className="text-terminal-primary text-sm">SSH Port (22)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModifyAllServersModal({
  isOpen,
  onClose,
  onModify,
  serverCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onModify: (ram: number, cores: number) => void;
  serverCount: number;
}) {
  const [ram, setRam] = useState(8);
  const [cores, setCores] = useState(1);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRam(8);
      setCores(1);
    }
  }, [isOpen]);

  const handleModify = () => {
    onModify(ram, cores);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modify All Purchased Servers"
    >
      <div className="space-y-4">
        <div className="text-terminal-dim text-sm mb-2">
          <p>This will update RAM and CPU cores for all {serverCount} purchased server{serverCount !== 1 ? 's' : ''}.</p>
        </div>

        <Select
          label="RAM"
          options={PURCHASED_RAM_OPTIONS}
          value={ram}
          onChange={(value) => setRam(Number(value))}
          showSearch={false}
        />

        <NumberInput
          label="CPU Cores"
          value={cores}
          onChange={setCores}
          min={1}
          max={8}
          step={1}
        />

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleModify} disabled={serverCount === 0}>
            Modify {serverCount} Server{serverCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AddPurchasedServerModal({
  isOpen,
  onClose,
  onAdd,
  existingNames,
  currentCount,
  mode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (hostname: string, ram: number, cores: number) => void;
  existingNames: string[];
  currentCount: number;
  mode: 'single' | 'max';
}) {
  const [serverName, setServerName] = useState('');
  const [prefix, setPrefix] = useState('pserv');
  const [ram, setRam] = useState(8);
  const [cores, setCores] = useState(1);
  const [error, setError] = useState('');
  const [userModifiedName, setUserModifiedName] = useState(false);

  const remainingSlots = MAX_PURCHASED_SERVERS - currentCount;

  // Helper function to generate a unique server name
  const generateUniqueName = (baseName: string): string => {
    if (!existingNames.includes(baseName)) {
      return baseName;
    }

    // Increment the number suffix until we find a unique name
    // e.g., my-server → my-server-2 → my-server-3 (not my-server-2-2)
    let counter = 2;
    let candidate = `${baseName}-${counter}`;
    while (existingNames.includes(candidate)) {
      counter++;
      candidate = `${baseName}-${counter}`;
    }
    return candidate;
  };

  // Reset state when modal opens and generate unique default name
  useEffect(() => {
    if (isOpen) {
      if (mode === 'single') {
        const uniqueName = generateUniqueName('my-server');
        setServerName(uniqueName);
        setUserModifiedName(false);
      } else {
        setPrefix('pserv');
      }
      setError('');
    }
  }, [isOpen, mode, existingNames]);

  const handleAddSingle = () => {
    setError('');

    if (!serverName.trim()) {
      setError('Server name is required');
      return;
    }

    // Only show "already exists" error if user manually changed the name
    // (The auto-generated name should never conflict)
    if (userModifiedName && existingNames.includes(serverName)) {
      setError('A server with this name already exists');
      return;
    }

    if (serverName.startsWith('hacknet-node-') || serverName.startsWith('hacknet-server-')) {
      setError('This hostname is reserved for hacknet nodes');
      return;
    }

    if (!isPowerOfTwo(ram)) {
      setError('RAM must be a power of 2');
      return;
    }

    if (ram < 1 || ram > PURCHASED_SERVER_MAX_RAM) {
      setError(`RAM must be between 1 and ${formatRam(PURCHASED_SERVER_MAX_RAM)}`);
      return;
    }

    onAdd(serverName, ram, cores);
    onClose();
  };

  const handleAddMax = () => {
    setError('');

    if (!prefix.trim()) {
      setError('Server name prefix is required');
      return;
    }

    if (!isPowerOfTwo(ram)) {
      setError('RAM must be a power of 2');
      return;
    }

    if (ram < 1 || ram > PURCHASED_SERVER_MAX_RAM) {
      setError(`RAM must be between 1 and ${formatRam(PURCHASED_SERVER_MAX_RAM)}`);
      return;
    }

    if (prefix.startsWith('hacknet-node-') || prefix.startsWith('hacknet-server-')) {
      setError('This hostname prefix is reserved for hacknet nodes');
      return;
    }

    // Add servers for all remaining slots
    const startNum = currentCount === 0 ? 1 : currentCount + 1;
    for (let i = 0; i < remainingSlots; i++) {
      const hostname = `${prefix}-${startNum + i}`;
      onAdd(hostname, ram, cores);
    }
    onClose();
  };

  // Handle server name change with real-time validation
  const handleServerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setServerName(newName);
    setUserModifiedName(true);

    // Real-time validation for user-entered names
    if (newName.trim() && existingNames.includes(newName)) {
      setError('A server with this name already exists');
    } else if (newName.startsWith('hacknet-node-') || newName.startsWith('hacknet-server-')) {
      setError('This hostname is reserved for hacknet nodes');
    } else {
      setError('');
    }
  };

  // Check if add button should be disabled
  const isAddDisabled = mode === 'single'
    ? remainingSlots === 0 || (userModifiedName && existingNames.includes(serverName))
    : remainingSlots === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'single' ? 'Add Purchased Server' : 'Add Max Servers'}
    >
      <div className="space-y-4">
        <div className="text-terminal-dim text-sm mb-2">
          {remainingSlots > 0 ? (
            <p>{remainingSlots} server slot{remainingSlots !== 1 ? 's' : ''} remaining ({currentCount}/{MAX_PURCHASED_SERVERS} used)</p>
          ) : (
            <p className="text-red-500">Maximum servers reached ({MAX_PURCHASED_SERVERS}/{MAX_PURCHASED_SERVERS})</p>
          )}
        </div>

        {mode === 'single' ? (
          <>
            <Input
              key={isOpen ? 'open' : 'closed'}
              label="Server Name"
              value={serverName}
              onChange={handleServerNameChange}
              placeholder="my-server"
              clearOnFocus
            />
            <p className="text-terminal-dim text-xs -mt-2">
              Enter a name for your server (e.g., "hackserver", "farm-01")
            </p>
          </>
        ) : (
          <>
            <Input
              key={isOpen ? 'open' : 'closed'}
              label="Server Name Prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="pserv"
              clearOnFocus
            />
            <p className="text-terminal-dim text-xs -mt-2">
              {remainingSlots} servers will be named: {prefix}-{currentCount === 0 ? 1 : currentCount + 1}, {prefix}-{currentCount === 0 ? 2 : currentCount + 2}, ..., {prefix}-{currentCount === 0 ? remainingSlots : currentCount + remainingSlots}
            </p>
          </>
        )}

        <Select
          label="RAM"
          options={PURCHASED_RAM_OPTIONS}
          value={ram}
          onChange={(value) => setRam(Number(value))}
          showSearch={false}
        />

        <NumberInput
          label="CPU Cores"
          value={cores}
          onChange={setCores}
          min={1}
          max={8}
          step={1}
        />

        {error && <p className="text-red-500 text-sm">&gt; ERROR: {error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {mode === 'single' ? (
            <Button onClick={handleAddSingle} disabled={isAddDisabled}>
              Add Server
            </Button>
          ) : (
            <Button onClick={handleAddMax} disabled={isAddDisabled}>
              Add {remainingSlots} Server{remainingSlots !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function ServersSection() {
  const allServers = useSaveStore((state) => state.currentSave?.AllServersSave);
  const originalServers = useSaveStore((state) => state.originalSave?.AllServersSave);
  const purchasedServersList = useSaveStore((state) => state.currentSave?.PlayerSave.data.purchasedServers ?? []);
  const updateServerStats = useSaveStore((state) => state.updateServerStats);
  const resetServer = useSaveStore((state) => state.resetServer);
  const resetAllServers = useSaveStore((state) => state.resetAllServers);
  const addPurchasedServer = useSaveStore((state) => state.addPurchasedServer);
  const removePurchasedServer = useSaveStore((state) => state.removePurchasedServer);
  const hasServerChanges = useSaveStore((state) => state.hasServerChanges());
  const hasHomeServerChanges = useSaveStore((state) => state.hasHomeServerChanges());
  const resetHomeServer = useSaveStore((state) => state.resetHomeServer);
  const hasNetworkServerChanges = useSaveStore((state) => state.hasNetworkServerChanges());
  const resetNetworkServers = useSaveStore((state) => state.resetNetworkServers);
  const hasPurchasedServerChanges = useSaveStore((state) => state.hasPurchasedServerChanges());
  const resetPurchasedServers = useSaveStore((state) => state.resetPurchasedServers);
  const status = useSaveStore((state) => state.status);

  const [search, setSearch] = useState('');
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);
  const [showHackableOnly, setShowHackableOnly] = useState(false);
  const [addModalMode, setAddModalMode] = useState<'single' | 'max' | null>(null);
  const [showModifyAllModal, setShowModifyAllModal] = useState(false);

  const homeServer = useMemo(() => {
    if (!allServers) return null;
    return allServers['home'] ?? null;
  }, [allServers]);

  const purchasedServers = useMemo(() => {
    if (!allServers) return [];
    return purchasedServersList
      .map((hostname) => allServers[hostname])
      .filter((server) => server !== undefined);
  }, [allServers, purchasedServersList]);

  const networkServers = useMemo(() => {
    if (!allServers) return [];
    return Object.values(allServers).filter(
      (server) => server.data.hostname !== 'home' && !purchasedServersList.includes(server.data.hostname)
    );
  }, [allServers, purchasedServersList]);

  const filteredNetworkServers = useMemo(() => {
    return networkServers.filter((server) => {
      const data = server.data;
      const isModified = originalServers
        ? JSON.stringify(originalServers[data.hostname]) !== JSON.stringify(server)
        : false;

      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          data.hostname.toLowerCase().includes(searchLower) ||
          data.organizationName.toLowerCase().includes(searchLower) ||
          data.ip.includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (showModifiedOnly && !isModified) return false;
      if (showHackableOnly && data.moneyMax === undefined) return false;

      return true;
    });
  }, [networkServers, search, showModifiedOnly, showHackableOnly, originalServers]);

  if (!allServers) {
    return (
      <Card title="Servers" subtitle="Load a save file to view and edit servers">
        <p className="text-terminal-dim text-sm">No save data loaded yet. Upload a save file to unlock server editing.</p>
      </Card>
    );
  }

  const existingHostnames = Object.keys(allServers);

  const tabs = [
    {
      id: 'owned',
      label: 'Owned Servers',
      content: (
        <div className="space-y-4">
          {/* Home Server */}
          {homeServer && (
            <HomeServerCard
              server={homeServer}
              onUpdate={updateServerStats}
              hasChanges={hasHomeServerChanges}
              onReset={resetHomeServer}
            />
          )}

          {/* Purchased Servers */}
          <Card
            title="Purchased Servers"
            subtitle={`${purchasedServers.length} of ${MAX_PURCHASED_SERVERS} servers`}
            actions={
              <div className="flex gap-2 items-center">
                {purchasedServers.length < MAX_PURCHASED_SERVERS && (
                  <>
                    <Button onClick={() => setAddModalMode('single')} className="text-xs px-2 py-1">
                      + ADD SERVER
                    </Button>
                    <Button onClick={() => setAddModalMode('max')} className="text-xs px-2 py-1">
                      + ADD MAX SERVERS
                    </Button>
                  </>
                )}
                {purchasedServers.length > 0 && (
                  <>
                    <Button onClick={() => setShowModifyAllModal(true)} className="text-xs px-2 py-1">
                      MODIFY ALL
                    </Button>
                    <Button
                      onClick={() => {
                        purchasedServers.forEach(server => removePurchasedServer(server.data.hostname));
                      }}
                      variant="danger"
                      className="text-xs px-2 py-1"
                    >
                      DELETE ALL
                    </Button>
                  </>
                )}
                <ResetAction
                  title="Reset Purchased Servers"
                  hasChanges={hasPurchasedServerChanges}
                  onReset={resetPurchasedServers}
                />
              </div>
            }
          >
            {purchasedServers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-terminal-dim text-sm mb-4">No purchased servers yet.</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setAddModalMode('single')}>Add Your First Server</Button>
                  <Button onClick={() => setAddModalMode('max')}>Add Max Servers</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {purchasedServers.map((server) => {
                  const isModified = originalServers
                    ? JSON.stringify(originalServers[server.data.hostname]) !== JSON.stringify(server)
                    : false;

                  return (
                    <PurchasedServerCard
                      key={server.data.hostname}
                      server={server}
                      isModified={isModified}
                      onUpdate={updateServerStats}
                      onReset={resetServer}
                      onRemove={removePurchasedServer}
                    />
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      ),
    },
    {
      id: 'network',
      label: 'Network Servers',
      content: (
        <Card
          title="Network Servers"
          subtitle={`${filteredNetworkServers.length} of ${networkServers.length} servers shown`}
          actions={
            <ResetAction
              title="Reset Network Servers"
              hasChanges={hasNetworkServerChanges}
              onReset={resetNetworkServers}
            />
          }
        >
          <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3 mb-4">
            <h3 className="text-terminal-secondary uppercase text-sm mb-3">Filters</h3>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hostname, organization, or IP..."
              className="mb-3"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={showModifiedOnly} onChange={(e) => setShowModifiedOnly(e.target.checked)} />
                <span className="text-terminal-primary text-sm">Modified Only</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={showHackableOnly} onChange={(e) => setShowHackableOnly(e.target.checked)} />
                <span className="text-terminal-primary text-sm">Hackable Only (Has Money)</span>
              </label>
            </div>

            {(search || showModifiedOnly || showHackableOnly) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setShowModifiedOnly(false);
                  setShowHackableOnly(false);
                }}
                className="mt-3 text-xs"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {filteredNetworkServers.length === 0 ? (
            <p className="text-terminal-dim text-sm">No servers match the current filters.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNetworkServers.map((server) => {
                const isModified = originalServers
                  ? JSON.stringify(originalServers[server.data.hostname]) !== JSON.stringify(server)
                  : false;

                return (
                  <NetworkServerCard
                    key={server.data.hostname}
                    server={server}
                    isModified={isModified}
                    onUpdate={updateServerStats}
                    onReset={resetServer}
                  />
                );
              })}
            </div>
          )}
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        title="Servers"
        subtitle="Manage home, purchased, and network servers"
        actions={
          <ResetAction
            title="Reset All Servers"
            hasChanges={hasServerChanges}
            onReset={resetAllServers}
            disabled={status === 'loading'}
          />
        }
      >
        <Tabs tabs={tabs} defaultTab="owned" />
      </Card>

      <AddPurchasedServerModal
        isOpen={addModalMode !== null}
        onClose={() => setAddModalMode(null)}
        onAdd={addPurchasedServer}
        existingNames={existingHostnames}
        currentCount={purchasedServers.length}
        mode={addModalMode || 'single'}
      />

      <ModifyAllServersModal
        isOpen={showModifyAllModal}
        onClose={() => setShowModifyAllModal(false)}
        onModify={(ram, cores) => {
          purchasedServers.forEach(server => {
            updateServerStats(server.data.hostname, { maxRam: ram, cpuCores: cores });
          });
        }}
        serverCount={purchasedServers.length}
      />
    </div>
  );
}
