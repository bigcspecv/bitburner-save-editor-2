import { useState, useMemo, useCallback } from 'react';
import { Card, Button, Input, NumberInput, ResetAction, Select, type SelectOption } from '../ui';
import { useSaveStore } from '../../store/save-store';
import type { Augmentation } from '../../models/schemas/player';

type AugmentationStatus = 'none' | 'installed' | 'queued';

interface AugmentationData {
  name: string;
  level: number;
  status: AugmentationStatus;
  originalStatus: AugmentationStatus;
  originalLevel: number;
}

function AugmentationCard({
  data,
  onStatusChange
}: {
  data: AugmentationData;
  onStatusChange: (name: string, newStatus: AugmentationStatus) => void;
}) {
  const hasChanged = data.status !== data.originalStatus;

  const statusOptions: SelectOption[] = [
    { value: 'none', label: 'None' },
    { value: 'queued', label: 'Queued' },
    { value: 'installed', label: 'Installed' },
  ];

  const handleStatusChange = (value: string) => {
    onStatusChange(data.name, value as AugmentationStatus);
  };

  const handleReset = () => {
    onStatusChange(data.name, data.originalStatus);
  };

  return (
    <div className={`border p-3 ${hasChanged ? 'border-terminal-secondary' : 'border-terminal-primary/40'} bg-terminal-dim/5`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-terminal-secondary uppercase tracking-wide text-sm flex-1">
          {data.name}
        </h4>
        {hasChanged && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            title="Reset to original"
          >
            ↺
          </Button>
        )}
      </div>

      <Select
        value={data.status}
        onChange={handleStatusChange}
        options={statusOptions}
        className="w-full"
      />

      {data.level > 1 && (
        <p className="text-terminal-dim text-xs mt-2">
          Level: {data.level}
        </p>
      )}
    </div>
  );
}

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
  const hasChanges = useSaveStore((state) => state.hasAugmentationChanges());
  const status = useSaveStore((state) => state.status);
  const isLoading = status === 'loading';

  const [search, setSearch] = useState('');

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

  // Build augmentation list (excluding NeuroFlux)
  const allAugmentations = useMemo((): AugmentationData[] => {
    const augMap = new Map<string, AugmentationData>();

    // Process installed augmentations
    player.augmentations?.forEach((aug) => {
      if (aug.name === 'NeuroFlux Governor') return;
      augMap.set(aug.name, {
        name: aug.name,
        level: aug.level,
        status: 'installed',
        originalStatus: originalPlayer.augmentations?.some(a => a.name === aug.name) ? 'installed' : 'none',
        originalLevel: originalPlayer.augmentations?.find(a => a.name === aug.name)?.level || 0,
      });
    });

    // Process queued augmentations
    player.queuedAugmentations?.forEach((aug) => {
      if (aug.name === 'NeuroFlux Governor') return;

      // Only set as queued if not already installed
      if (!augMap.has(aug.name)) {
        augMap.set(aug.name, {
          name: aug.name,
          level: aug.level,
          status: 'queued',
          originalStatus: originalPlayer.queuedAugmentations?.some(a => a.name === aug.name) ? 'queued' : 'none',
          originalLevel: originalPlayer.queuedAugmentations?.find(a => a.name === aug.name)?.level || 0,
        });
      }
    });

    return Array.from(augMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [player.augmentations, player.queuedAugmentations, originalPlayer.augmentations, originalPlayer.queuedAugmentations]);

  const filteredAugmentations = useMemo(() => {
    if (!search) return allAugmentations;
    const searchLower = search.toLowerCase();
    return allAugmentations.filter(aug => aug.name.toLowerCase().includes(searchLower));
  }, [allAugmentations, search]);

  const handleStatusChange = useCallback((name: string, newStatus: AugmentationStatus) => {
    mutateCurrentSave((draft) => {
      const installedAugs = [...(draft.PlayerSave.data.augmentations || [])];
      const queuedAugs = [...(draft.PlayerSave.data.queuedAugmentations || [])];

      // Remove from both arrays
      const installedIndex = installedAugs.findIndex(a => a.name === name);
      const queuedIndex = queuedAugs.findIndex(a => a.name === name);

      if (installedIndex >= 0) installedAugs.splice(installedIndex, 1);
      if (queuedIndex >= 0) queuedAugs.splice(queuedIndex, 1);

      // Add to appropriate array based on new status
      if (newStatus === 'installed') {
        installedAugs.push({ name, level: 1 });
      } else if (newStatus === 'queued') {
        queuedAugs.push({ name, level: 1 });
      }

      draft.PlayerSave.data.augmentations = installedAugs;
      draft.PlayerSave.data.queuedAugmentations = queuedAugs;
    });
  }, [mutateCurrentSave]);

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
        subtitle={`${allAugmentations.length} augmentation${allAugmentations.length !== 1 ? 's' : ''} available`}
      >
        <div className="mb-4">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search augmentations..."
          />
        </div>

        {filteredAugmentations.length === 0 ? (
          <p className="text-terminal-dim text-sm text-center py-8">
            {search
              ? 'No augmentations match your search'
              : 'No augmentations found'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAugmentations.map((aug) => (
              <AugmentationCard
                key={aug.name}
                data={aug}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
