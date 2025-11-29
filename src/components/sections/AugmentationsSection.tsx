import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, Button, Input, NumberInput, ResetAction } from '../ui';
import { useSaveStore } from '../../store/save-store';
import { buildAugmentationList, filterAugmentations, type AugmentationFilters } from '../../lib/augmentation-utils';
import { AugmentationCard } from './AugmentationCard';

interface NeuroFluxEditorProps {
  installedLevel: number;
  queuedLevel: number;
  originalInstalledLevel: number;
  originalQueuedLevel: number;
  onUpdate: (installedLevel: number, queuedLevel: number) => void;
}

function NeuroFluxEditor({
  installedLevel,
  queuedLevel,
  originalInstalledLevel,
  originalQueuedLevel,
  onUpdate,
}: NeuroFluxEditorProps) {
  const [localInstalled, setLocalInstalled] = useState(installedLevel);
  const [localQueued, setLocalQueued] = useState(queuedLevel);

  // Sync local state when props change (e.g., from external reset)
  useEffect(() => {
    setLocalInstalled(installedLevel);
    setLocalQueued(queuedLevel);
  }, [installedLevel, queuedLevel]);

  const hasChanged =
    installedLevel !== originalInstalledLevel ||
    queuedLevel !== originalQueuedLevel;

  const hasLocalChanges =
    localInstalled !== installedLevel ||
    localQueued !== queuedLevel;

  const handleUpdate = () => {
    const finalInstalled = Math.max(0, Math.min(10000, localInstalled));
    const finalQueued = Math.max(finalInstalled, Math.min(10000, localQueued));
    onUpdate(finalInstalled, finalQueued);
  };

  const handleReset = () => {
    setLocalInstalled(originalInstalledLevel);
    setLocalQueued(originalQueuedLevel);
    onUpdate(originalInstalledLevel, originalQueuedLevel);
  };

  const handleCancel = () => {
    setLocalInstalled(installedLevel);
    setLocalQueued(queuedLevel);
  };

  // Ensure queued level is at least installed level
  const handleInstalledChange = (value: number) => {
    setLocalInstalled(value);
    if (value > localQueued) {
      setLocalQueued(value);
    }
  };

  const handleQueuedChange = (value: number) => {
    const adjusted = Math.max(localInstalled, value);
    setLocalQueued(adjusted);
  };

  return (
    <div className={`border ${hasChanged ? 'border-terminal-secondary' : 'border-terminal-primary'} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-terminal-secondary uppercase tracking-wide text-lg">
          NeuroFlux Governor
        </h3>
        {hasChanged && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
          >
            Reset to Original
          </Button>
        )}
      </div>

      <p className="text-terminal-dim text-sm mb-4">
        This augmentation can be purchased multiple times. Each level provides a small bonus to all stats.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <NumberInput
            label="Installed up to Level"
            value={localInstalled}
            onChange={handleInstalledChange}
            min={0}
            max={10000}
            step={1}
            showButtons={true}
          />
          {localInstalled > 0 && (
            <p className="text-terminal-dim text-xs mt-1">
              Levels 1-{localInstalled}
            </p>
          )}
        </div>

        <div>
          <NumberInput
            label="Queued up to Level"
            value={localQueued}
            onChange={handleQueuedChange}
            min={localInstalled}
            max={10000}
            step={1}
            showButtons={true}
          />
          {localQueued > localInstalled && (
            <p className="text-terminal-dim text-xs mt-1">
              Levels {localInstalled + 1}-{localQueued}
            </p>
          )}
        </div>
      </div>

      {hasLocalChanges && (
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </div>
      )}
    </div>
  );
}

export function AugmentationsSection() {
  const player = useSaveStore((state) => state.currentSave?.PlayerSave.data);
  const originalPlayer = useSaveStore((state) => state.originalSave?.PlayerSave.data);
  const mutateCurrentSave = useSaveStore((state) => state.mutateCurrentSave);
  const resetAugmentations = useSaveStore((state) => state.resetAugmentations);
  const resetOtherAugmentations = useSaveStore((state) => state.resetOtherAugmentations);
  const hasChanges = useSaveStore((state) => state.hasAugmentationChanges());
  const hasOtherAugmentationChanges = useSaveStore((state) => state.hasOtherAugmentationChanges());
  const status = useSaveStore((state) => state.status);
  const isLoading = status === 'loading';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AugmentationFilters>({
    status: {},
    effects: {},
  });
  const [selectedAugmentations, setSelectedAugmentations] = useState<Set<string>>(new Set());

  if (!player || !originalPlayer) {
    return (
      <Card title="Augmentations" subtitle="Load a save file to edit augmentations">
        <p className="text-terminal-dim text-sm">
          No save data loaded yet. Upload a save file to unlock augmentation editing.
        </p>
      </Card>
    );
  }

  // Calculate NeuroFlux levels
  const neurofluxData = useMemo(() => {
    const installed = player.augmentations?.filter((a) => a.name === 'NeuroFlux Governor') || [];
    const queued = player.queuedAugmentations?.filter((a) => a.name === 'NeuroFlux Governor') || [];
    const originalInstalled = originalPlayer.augmentations?.filter((a) => a.name === 'NeuroFlux Governor') || [];
    const originalQueued = originalPlayer.queuedAugmentations?.filter((a) => a.name === 'NeuroFlux Governor') || [];

    // Installed: single entry with max level
    const installedLevel = installed.length > 0 ? Math.max(...installed.map((a) => a.level)) : 0;

    // Queued: multiple entries, get the highest level
    const queuedLevel = queued.length > 0 ? Math.max(...queued.map((a) => a.level)) : installedLevel;

    const originalInstalledLevel = originalInstalled.length > 0 ? Math.max(...originalInstalled.map((a) => a.level)) : 0;
    const originalQueuedLevel = originalQueued.length > 0 ? Math.max(...originalQueued.map((a) => a.level)) : originalInstalledLevel;

    return {
      installedLevel,
      queuedLevel,
      originalInstalledLevel,
      originalQueuedLevel,
    };
  }, [player.augmentations, player.queuedAugmentations, originalPlayer.augmentations, originalPlayer.queuedAugmentations]);

  // Build complete augmentation list with status (all 128 augmentations, excluding NeuroFlux)
  const allAugmentations = useMemo(() => {
    const installedAugs = player.augmentations || [];
    const queuedAugs = player.queuedAugmentations || [];

    // Get all augmentations with status
    const augsList = buildAugmentationList(installedAugs, queuedAugs);

    // Exclude NeuroFlux Governor (handled separately)
    return augsList.filter((aug) => aug.key !== 'NeuroFluxGovernor');
  }, [player.augmentations, player.queuedAugmentations]);

  // Track original status for change detection
  const originalAugmentations = useMemo(() => {
    const installedAugs = originalPlayer.augmentations || [];
    const queuedAugs = originalPlayer.queuedAugmentations || [];
    return buildAugmentationList(installedAugs, queuedAugs);
  }, [originalPlayer.augmentations, originalPlayer.queuedAugmentations]);

  const filteredAugmentations = useMemo(() => {
    return filterAugmentations(allAugmentations, {
      search,
      ...filters,
    });
  }, [allAugmentations, search, filters]);

  const handleStatusChange = useCallback((key: string, newStatus: 'none' | 'queued' | 'installed') => {
    mutateCurrentSave((draft) => {
      const installedAugs = [...(draft.PlayerSave.data.augmentations || [])];
      const queuedAugs = [...(draft.PlayerSave.data.queuedAugmentations || [])];

      // Find the augmentation data to get both key and display name
      const aug = allAugmentations.find(a => a.key === key);
      if (!aug) return;

      // Remove from both arrays (check both key and name)
      const removeFromArray = (arr: Array<{ name: string; level: number }>, augKey: string, augName: string) => {
        const index = arr.findIndex(a => a.name === augKey || a.name === augName);
        if (index >= 0) arr.splice(index, 1);
      };

      removeFromArray(installedAugs, key, aug.name);
      removeFromArray(queuedAugs, key, aug.name);

      // Add to appropriate array based on new status (use internal key)
      if (newStatus === 'installed') {
        installedAugs.push({ name: key, level: 1 });
      } else if (newStatus === 'queued') {
        queuedAugs.push({ name: key, level: 1 });
      }

      draft.PlayerSave.data.augmentations = installedAugs;
      draft.PlayerSave.data.queuedAugmentations = queuedAugs;
    });
  }, [mutateCurrentSave, allAugmentations]);

  const handleAugmentationReset = useCallback((key: string) => {
    const originalAug = originalAugmentations.find(a => a.key === key);
    if (originalAug) {
      handleStatusChange(key, originalAug.status);
    }
  }, [originalAugmentations, handleStatusChange]);

  const handleNeuroFluxUpdate = useCallback((installedLevel: number, queuedLevel: number) => {
    mutateCurrentSave((draft) => {
      const installedAugs = [...(draft.PlayerSave.data.augmentations || [])];
      const queuedAugs = [...(draft.PlayerSave.data.queuedAugmentations || [])];

      // Remove all NeuroFlux entries
      const nonNeuroInstalled = installedAugs.filter(a => a.name !== 'NeuroFlux Governor');
      const nonNeuroQueued = queuedAugs.filter(a => a.name !== 'NeuroFlux Governor');

      // Add installed NeuroFlux as a SINGLE entry with max level
      if (installedLevel > 0) {
        nonNeuroInstalled.push({ name: 'NeuroFlux Governor', level: installedLevel });
      }

      // Add queued NeuroFlux as MULTIPLE entries, one for each level from installed+1 to queued
      if (queuedLevel > installedLevel) {
        for (let level = installedLevel + 1; level <= queuedLevel; level++) {
          nonNeuroQueued.push({ name: 'NeuroFlux Governor', level });
        }
      }

      draft.PlayerSave.data.augmentations = nonNeuroInstalled;
      draft.PlayerSave.data.queuedAugmentations = nonNeuroQueued;
    });
  }, [mutateCurrentSave]);

  const handleToggleSelect = useCallback((key: string) => {
    setSelectedAugmentations((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAugmentations(new Set(filteredAugmentations.map(a => a.key)));
  }, [filteredAugmentations]);

  const handleSelectNone = useCallback(() => {
    setSelectedAugmentations(new Set());
  }, []);

  const handleBulkStatusChange = useCallback((newStatus: 'none' | 'queued' | 'installed') => {
    selectedAugmentations.forEach((key) => {
      handleStatusChange(key, newStatus);
    });
    setSelectedAugmentations(new Set());
  }, [selectedAugmentations, handleStatusChange]);

  const installedCount = allAugmentations.filter(a => a.status === 'installed').length;
  const queuedCount = allAugmentations.filter(a => a.status === 'queued').length;

  return (
    <div className="space-y-4">
      <Card
        title="Augmentations Overview"
        subtitle="View and edit installed and queued augmentations"
        actions={
          <ResetAction
            title="Reset All Augmentations"
            hasChanges={hasChanges}
            onReset={resetAugmentations}
            disabled={isLoading}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
            <h4 className="text-terminal-secondary uppercase tracking-wide text-sm mb-2">
              Installed
            </h4>
            <p className="text-terminal-primary text-2xl">
              {installedCount}
            </p>
            {neurofluxData.installedLevel > 0 && (
              <p className="text-terminal-dim text-xs mt-1">
                + NeuroFlux Level {neurofluxData.installedLevel}
              </p>
            )}
          </div>

          <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
            <h4 className="text-terminal-secondary uppercase tracking-wide text-sm mb-2">
              Queued
            </h4>
            <p className="text-terminal-primary text-2xl">
              {queuedCount}
            </p>
            {neurofluxData.queuedLevel > neurofluxData.installedLevel && (
              <p className="text-terminal-dim text-xs mt-1">
                + NeuroFlux Levels {neurofluxData.installedLevel + 1}-{neurofluxData.queuedLevel}
              </p>
            )}
          </div>

          <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
            <h4 className="text-terminal-secondary uppercase tracking-wide text-sm mb-2">
              Total
            </h4>
            <p className="text-terminal-primary text-2xl">
              {installedCount + queuedCount}
            </p>
          </div>
        </div>
      </Card>

      <Card
        title="NeuroFlux Governor"
        subtitle="Special augmentation that can be purchased multiple times"
      >
        <NeuroFluxEditor
          installedLevel={neurofluxData.installedLevel}
          queuedLevel={neurofluxData.queuedLevel}
          originalInstalledLevel={neurofluxData.originalInstalledLevel}
          originalQueuedLevel={neurofluxData.originalQueuedLevel}
          onUpdate={handleNeuroFluxUpdate}
        />
      </Card>

      <Card
        title="Other Augmentations"
        subtitle={`${allAugmentations.length} augmentations available in Bitburner`}
        actions={
          <ResetAction
            title="Reset Other Augmentations"
            hasChanges={hasOtherAugmentationChanges}
            onReset={resetOtherAugmentations}
            disabled={isLoading}
          />
        }
      >
        {/* Search & Filters */}
        <div className="mb-4 border border-terminal-primary/30 p-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="text-terminal-secondary text-sm uppercase">Search & Filters</h4>
            {(search || Object.values(filters.status || {}).some(Boolean) || Object.values(filters.effects || {}).some(Boolean)) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setFilters({ status: {}, effects: {} });
                }}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {/* Search */}
            <div>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description, or faction..."
              />
            </div>

            {/* Status & Effect Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Status Filters */}
              <div>
                <label className="block text-terminal-dim text-xs mb-2 font-mono">STATUS</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'none', label: 'Available' },
                    { key: 'queued', label: 'Queued' },
                    { key: 'installed', label: 'Installed' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          status: {
                            ...prev.status,
                            [key]: !prev.status?.[key as keyof typeof prev.status],
                          },
                        }))
                      }
                      className={`px-3 py-1 text-xs border font-mono transition-colors ${
                        filters.status?.[key as keyof typeof filters.status]
                          ? 'border-terminal-secondary bg-terminal-secondary/20 text-terminal-secondary'
                          : 'border-terminal-primary/40 text-terminal-primary/60 hover:border-terminal-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effect Filters */}
              <div>
                <label className="block text-terminal-dim text-xs mb-2 font-mono">EFFECTS</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'hacking', label: 'Hacking' },
                    { key: 'strength', label: 'Strength' },
                    { key: 'defense', label: 'Defense' },
                    { key: 'dexterity', label: 'Dexterity' },
                    { key: 'agility', label: 'Agility' },
                    { key: 'charisma', label: 'Charisma' },
                    { key: 'company_rep', label: 'Company Rep' },
                    { key: 'faction_rep', label: 'Faction Rep' },
                    { key: 'crime', label: 'Crime' },
                    { key: 'hacknet', label: 'Hacknet' },
                    { key: 'bladeburner', label: 'Bladeburner' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          effects: {
                            ...prev.effects,
                            [key]: !prev.effects?.[key as keyof typeof prev.effects],
                          },
                        }))
                      }
                      className={`px-3 py-1 text-xs border font-mono transition-colors ${
                        filters.effects?.[key as keyof typeof filters.effects]
                          ? 'border-terminal-secondary bg-terminal-secondary/20 text-terminal-secondary'
                          : 'border-terminal-primary/40 text-terminal-primary/60 hover:border-terminal-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selection & Bulk Actions */}
        <div className="mb-4 border border-terminal-primary/30 p-3">
          <h4 className="text-terminal-secondary text-sm uppercase mb-3">
            Select & Bulk Actions ({selectedAugmentations.size} selected)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Selection Controls */}
            <div>
              <label className="block text-terminal-dim text-xs mb-2 font-mono">
                SELECT AUGMENTATIONS
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredAugmentations.length === 0}
                >
                  Select All Filtered ({filteredAugmentations.length})
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectNone}
                  disabled={selectedAugmentations.size === 0}
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            <div>
              <label className="block text-terminal-dim text-xs mb-2 font-mono">
                BULK ACTIONS
              </label>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBulkStatusChange('installed')}
                  disabled={selectedAugmentations.size === 0}
                >
                  Set Installed
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBulkStatusChange('queued')}
                  disabled={selectedAugmentations.size === 0}
                >
                  Set Queued
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkStatusChange('none')}
                  disabled={selectedAugmentations.size === 0}
                >
                  Set None
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredAugmentations.length === 0 ? (
          <p className="text-terminal-dim text-sm text-center py-8">
            {search
              ? 'No augmentations match your search'
              : 'No augmentations found'}
          </p>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3">
            {filteredAugmentations.map((aug) => {
              const originalAug = originalAugmentations.find(a => a.key === aug.key);
              const hasChanged = originalAug?.status !== aug.status;

              return (
                <div key={aug.key} className="break-inside-avoid">
                  <AugmentationCard
                    augmentation={aug}
                    installedAugs={player.augmentations || []}
                    queuedAugs={player.queuedAugmentations || []}
                    onStatusChange={handleStatusChange}
                    onReset={handleAugmentationReset}
                    hasChanges={hasChanged}
                    selected={selectedAugmentations.has(aug.key)}
                    onToggleSelect={handleToggleSelect}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
