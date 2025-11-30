import { useCallback, useMemo, useState } from 'react';
import { Card, Input, NumberInput, Checkbox, Button, Select, ResetAction, Modal } from '../ui';
import { useSaveStore } from '../../store/save-store';
import type { FactionDiscovery } from '../../models/types';

const discoveryOptions = [
  { value: 'known', label: 'Known' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'rumored', label: 'Rumored' },
];

type StatusFilterKey = 'members' | 'invited' | 'changed';
const statusFilterButtons: Array<{ key: StatusFilterKey; label: string }> = [
  { key: 'members', label: 'Members Only' },
  { key: 'invited', label: 'Invited Only' },
  { key: 'changed', label: 'Modified Only' },
];

type DiscoveryFilter = 'all' | FactionDiscovery;
type CityFilter = 'all' | 'Aevum' | 'Chongqing' | 'Ishima' | 'New Tokyo' | 'Sector-12' | 'Volhaven';

type FiltersState = {
  members: boolean;
  invited: boolean;
  changed: boolean;
  discovery: DiscoveryFilter;
  companies: boolean;
  city: CityFilter;
};

const companyFactions = new Set<string>([
  'ECorp',
  'MegaCorp',
  'Bachman & Associates',
  'Blade Industries',
  'NWO',
  'Clarke Incorporated',
  'OmniTek Incorporated',
  'Four Sigma',
  'KuaiGong International',
  'Fulcrum Secret Technologies',
]);

const factionCityMap: Record<string, CityFilter[]> = {
  Aevum: ['Aevum'],
  Chongqing: ['Chongqing'],
  Ishima: ['Ishima'],
  'New Tokyo': ['New Tokyo'],
  'Sector-12': ['Sector-12'],
  Volhaven: ['Volhaven'],
  'The Syndicate': ['Aevum', 'Sector-12'],
  'The Dark Army': ['Chongqing'],
  Tetrads: ['Chongqing', 'New Tokyo', 'Ishima'],
  'Tian Di Hui': ['Chongqing', 'New Tokyo', 'Ishima'],
  'Church of the Machine God': ['Chongqing'],
};

const cityOptions = [
  { value: 'all', label: 'All Cities' },
  { value: 'Aevum', label: 'Aevum' },
  { value: 'Chongqing', label: 'Chongqing' },
  { value: 'Ishima', label: 'Ishima' },
  { value: 'New Tokyo', label: 'New Tokyo' },
  { value: 'Sector-12', label: 'Sector-12' },
  { value: 'Volhaven', label: 'Volhaven' },
];

export function FactionsSection() {
  const player = useSaveStore((state) => state.currentSave?.PlayerSave.data);
  const originalPlayer = useSaveStore((state) => state.originalSave?.PlayerSave.data);
  const factionsSave = useSaveStore((state) => state.currentSave?.FactionsSave);
  const originalFactionsSave = useSaveStore((state) => state.originalSave?.FactionsSave);
  const updateFactionStats = useSaveStore((state) => state.updateFactionStats);
  const setFactionMembership = useSaveStore((state) => state.setFactionMembership);
  const setFactionInvitation = useSaveStore((state) => state.setFactionInvitation);
  const resetFaction = useSaveStore((state) => state.resetFaction);
  const resetFactions = useSaveStore((state) => state.resetFactions);
  const hasFactionChanges = useSaveStore((state) => state.hasFactionChanges());
  const status = useSaveStore((state) => state.status);
  const isLoading = status === 'loading';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FiltersState>({
    members: false,
    invited: false,
    changed: false,
    discovery: 'all' as DiscoveryFilter,
    companies: false,
    city: 'all',
  });
  const [selectedFactions, setSelectedFactions] = useState<Set<string>>(new Set());
  const [bulkValueModal, setBulkValueModal] = useState<{ type: 'reputation' | 'favor'; value: number } | null>(null);

  const factions = useMemo(() => {
    if (!player || !factionsSave) return [];

    const baseKeys = originalFactionsSave ? Object.keys(originalFactionsSave) : Object.keys(factionsSave);
    const names = Array.from(new Set([...baseKeys, ...Object.keys(factionsSave)]));

    return names.map((name) => {
      const faction = factionsSave[name] ?? { discovery: 'unknown' as FactionDiscovery };
      const originalFaction = originalFactionsSave?.[name] ?? { discovery: 'unknown' as FactionDiscovery };
      const isMember = player.factions.includes(name);
      const isInvited = player.factionInvitations.includes(name);
      const originalMember = originalPlayer?.factions.includes(name) ?? false;
      const originalInvited = originalPlayer?.factionInvitations.includes(name) ?? false;

      const changed =
        JSON.stringify(faction) !== JSON.stringify(originalFaction) ||
        isMember !== originalMember ||
        isInvited !== originalInvited;

      return {
        name,
        faction,
        originalFaction,
        isMember,
        isInvited,
        changed,
      };
    });
  }, [factionsSave, originalFactionsSave, player, originalPlayer]);

  const memberCount = player?.factions.length ?? 0;
  const inviteCount = player?.factionInvitations.length ?? 0;
  const bannedCount = factions.filter((f) => f.faction.isBanned).length;
  const knownCount = factions.filter((f) => f.faction.discovery === 'known').length;
  const changedCount = factions.filter((f) => f.changed).length;

  const filteredFactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return factions.filter((faction) => {
      const factionCities = factionCityMap[faction.name] ?? [];
      if (query && !faction.name.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.members && !faction.isMember) return false;
      if (filters.invited && !faction.isInvited) return false;
      if (filters.changed && !faction.changed) return false;
      if (filters.discovery !== 'all' && faction.faction.discovery !== filters.discovery) return false;
      if (filters.companies && !companyFactions.has(faction.name)) return false;
      if (filters.city !== 'all' && !factionCities.includes(filters.city)) return false;
      return true;
    });
  }, [factions, search, filters]);

  const handleToggleSelect = useCallback((name: string) => {
    setSelectedFactions((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const handleSelectAllFiltered = useCallback(() => {
    setSelectedFactions(new Set(filteredFactions.map((f) => f.name)));
  }, [filteredFactions]);

  const handleClearSelection = useCallback(() => {
    setSelectedFactions(new Set());
  }, []);

  const applyToSelection = useCallback(
    (action: (name: string) => void) => {
      selectedFactions.forEach((name) => action(name));
    },
    [selectedFactions]
  );

  const handleBulkMembership = useCallback(
    (isMember: boolean) => {
      applyToSelection((name) => setFactionMembership(name, isMember));
    },
    [applyToSelection, setFactionMembership]
  );

  const handleBulkInvitations = useCallback(
    (invited: boolean) => {
      applyToSelection((name) => setFactionInvitation(name, invited));
    },
    [applyToSelection, setFactionInvitation]
  );

  const handleBulkBanned = useCallback(
    (isBanned: boolean) => {
      applyToSelection((name) => updateFactionStats(name, { isBanned }));
    },
    [applyToSelection, updateFactionStats]
  );

  const handleBulkReset = useCallback(() => {
    applyToSelection((name) => resetFaction(name));
  }, [applyToSelection, resetFaction]);

  const hasActiveFilters =
    search ||
    filters.members ||
    filters.invited ||
    filters.changed ||
    filters.discovery !== 'all' ||
    filters.companies ||
    filters.city !== 'all';
  const selectedCount = selectedFactions.size;
  const companyFactionCount = useMemo(
    () => factions.filter((f) => companyFactions.has(f.name)).length,
    [factions]
  );

  const selectionSnapshot = useMemo(() => {
    const selected = factions.filter((f) => selectedFactions.has(f.name));
    const computeState = (predicate: (faction: (typeof factions)[number]) => boolean) => {
      if (selected.length === 0) return 'none' as const;
      const matches = selected.filter(predicate).length;
      if (matches === 0) return 'unchecked' as const;
      if (matches === selected.length) return 'checked' as const;
      return 'indeterminate' as const;
    };

    return {
      member: computeState((f) => f.isMember),
      invited: computeState((f) => f.isInvited),
      banned: computeState((f) => f.faction.isBanned ?? false),
    };
  }, [factions, selectedFactions]);

  const handleOpenBulkValueModal = useCallback(
    (type: 'reputation' | 'favor') => {
      if (selectedCount === 0) return;
      setBulkValueModal({ type, value: 0 });
    },
    [selectedCount]
  );

  const handleConfirmBulkValue = useCallback(() => {
    if (!bulkValueModal) return;
    const { type, value } = bulkValueModal;

    const updates =
      type === 'reputation'
        ? (name: string) => updateFactionStats(name, { playerReputation: value })
        : (name: string) => updateFactionStats(name, { favor: value });

    applyToSelection(updates);
    setBulkValueModal(null);
  }, [applyToSelection, bulkValueModal, updateFactionStats]);

  if (!player || !factionsSave) {
    return (
      <Card title="Factions" subtitle="Load a save file to edit factions">
        <p className="text-terminal-dim text-sm">
          No save data loaded yet. Upload a save file to manage faction memberships, invitations, reputation, and favor.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card
          title="Factions"
          subtitle="Membership, invitations, reputation, and favor"
          actions={
            <ResetAction
              title="Reset All Factions"
              hasChanges={hasFactionChanges}
              onReset={resetFactions}
              disabled={isLoading}
            />
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
              <h4 className="text-terminal-secondary uppercase tracking-wide text-sm mb-1">
                Members
              </h4>
              <p className="text-terminal-primary text-2xl">{memberCount}</p>
              <p className="text-terminal-dim text-xs mt-1">
                Joined factions listed in player data
              </p>
            </div>

            <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
              <h4 className="text-terminal-secondary uppercase tracking-wide text-sm mb-1">
                Invitations
              </h4>
              <p className="text-terminal-primary text-2xl">{inviteCount}</p>
              <p className="text-terminal-dim text-xs mt-1">
                Pending invites you can accept later
              </p>
            </div>

            <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
              <h4 className="text-terminal-secondary uppercase tracking-wide text-sm mb-1">
                Known / Rumored
              </h4>
              <p className="text-terminal-primary text-2xl">
                {knownCount} / {factions.length - knownCount}
              </p>
              <p className="text-terminal-dim text-xs mt-1">
                Discovery state from the save file
              </p>
            </div>

            <div className="border border-terminal-primary/50 bg-terminal-dim/10 p-3">
              <h4 className="text-terminal-secondary uppercase tracking-wide text-sm mb-1">
                Changes
              </h4>
              <p className="text-terminal-primary text-2xl">{changedCount}</p>
              <p className="text-terminal-dim text-xs mt-1">
                Modified factions vs original save
              </p>
            </div>
          </div>

          <div className="mt-4 border border-terminal-primary/30 p-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Input
                  label="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by faction name..."
                />
              </div>
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setFilters({
                      members: false,
                      invited: false,
                      changed: false,
                      discovery: 'all',
                      companies: false,
                      city: 'all',
                    });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="space-y-3">
                <div>
                  <p className="text-terminal-dim text-xs uppercase font-mono mb-2">Status Filters</p>
                  <div className="flex flex-wrap gap-2">
                    {statusFilterButtons.map(({ key, label }) => {
                      const active = filters[key];
                      return (
                        <Button
                          key={key}
                          variant={active ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-terminal-dim text-xs uppercase font-mono mb-2">Faction Type</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filters.companies ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          companies: !prev.companies,
                        }))
                      }
                    >
                      Companies
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-terminal-dim text-xs uppercase font-mono mb-2">City</p>
                <Select
                  options={cityOptions}
                  value={filters.city}
                  onChange={(value) => setFilters((prev) => ({ ...prev, city: value as CityFilter }))}
                />
              </div>

              <div>
                <p className="text-terminal-dim text-xs uppercase font-mono mb-2">Discovery</p>
                <Select
                  options={[
                    { value: 'all', label: 'All' },
                    ...discoveryOptions,
                  ]}
                  value={filters.discovery}
                  onChange={(value) => setFilters((prev) => ({ ...prev, discovery: value as DiscoveryFilter }))}
                />
              </div>

              <div className="self-end text-terminal-dim text-xs font-mono space-y-1">
                <p>&gt; Filtered results: {filteredFactions.length} / {factions.length}</p>
                <p>&gt; Banned factions: {bannedCount}</p>
                <p>&gt; Company factions: {companyFactionCount}</p>
              </div>
            </div>
          </div>

        <div className="mt-4 border border-terminal-primary/30 p-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="text-terminal-secondary text-sm uppercase">
              Select & Bulk Actions ({selectedCount} selected)
            </h4>
            {selectedCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleClearSelection}>
                Clear Selection
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-terminal-dim text-xs uppercase font-mono">Selection</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAllFiltered}
                  disabled={filteredFactions.length === 0}
                >
                  Select All Filtered ({filteredFactions.length})
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearSelection}
                  disabled={selectedCount === 0}
                >
                  Clear Selection
                </Button>
              </div>
              <p className="text-terminal-dim text-xs">
                Choose factions using the checkboxes on each card to apply bulk changes.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-terminal-dim text-xs uppercase font-mono">Bulk Actions</p>
              <div className="flex flex-wrap gap-3 items-center">
                {[
                  { label: 'Member', key: 'member' as const, handler: () => handleBulkMembership(selectionSnapshot.member === 'checked' ? false : true) },
                  { label: 'Invited', key: 'invited' as const, handler: () => handleBulkInvitations(selectionSnapshot.invited === 'checked' ? false : true) },
                  { label: 'Banned', key: 'banned' as const, handler: () => handleBulkBanned(selectionSnapshot.banned === 'checked' ? false : true) },
                ].map(({ label, key, handler }) => {
                  const stateValue = selectionSnapshot[key];
                  const triState =
                    stateValue === 'checked'
                      ? 'checked'
                      : stateValue === 'indeterminate'
                      ? 'indeterminate'
                      : 'unchecked';

                  return (
                    <Checkbox
                      key={label}
                      triState
                      state={triState}
                      onStateChange={handler}
                      disabled={selectedCount === 0}
                      label={label}
                    />
                  );
                })}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedCount === 0}
                  onClick={() => handleOpenBulkValueModal('reputation')}
                >
                  Set Reputation
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedCount === 0}
                  onClick={() => handleOpenBulkValueModal('favor')}
                >
                  Set Favor
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkReset}
                  disabled={selectedCount === 0}
                >
                  Reset Selected
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredFactions.length === 0 ? (
          <p className="text-terminal-dim text-sm text-center py-8">
            {hasActiveFilters ? 'No factions match your filters' : 'No factions found in this save'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
            {filteredFactions.map(({ name, faction, isMember, isInvited, changed }) => {
              const favor = faction.favor ?? 0;
              const reputation = faction.playerReputation ?? 0;
              const discovery = faction.discovery ?? 'unknown';
              const isBanned = faction.isBanned ?? false;
              const isSelected = selectedFactions.has(name);

              return (
                <div
                  key={name}
                  className={`border p-3 ${changed ? 'border-terminal-secondary' : 'border-terminal-primary/40'} ${
                    isSelected ? 'bg-terminal-secondary/10' : 'bg-black'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2">
                      <Checkbox checked={isSelected} onChange={() => handleToggleSelect(name)} />
                      <div>
                        <h3 className="text-terminal-secondary uppercase tracking-wide text-lg">
                          {name}
                        </h3>
                        <p className="text-terminal-dim text-xs">
                          Discovery: {discovery}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {changed && (
                        <span className="text-terminal-secondary text-2xs uppercase font-mono">Modified</span>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => resetFaction(name)}
                        disabled={!changed || isLoading}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <NumberInput
                      label="Reputation"
                      value={reputation}
                      onChange={(value) => updateFactionStats(name, { playerReputation: value })}
                      showButtons={false}
                      step={1000}
                    />
                    <NumberInput
                      label="Favor"
                      value={favor}
                      onChange={(value) => updateFactionStats(name, { favor: value })}
                      showButtons={false}
                      min={0}
                      step={1}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                      label="Discovery"
                      options={discoveryOptions}
                      value={discovery}
                      onChange={(value) => updateFactionStats(name, { discovery: value as FactionDiscovery })}
                    />

                    <div className="flex flex-col gap-2">
                      <Checkbox
                        label="Member"
                        checked={isMember}
                        onChange={(e) => setFactionMembership(name, e.target.checked)}
                        disabled={isLoading}
                      />
                      <Checkbox
                        label="Invited"
                        checked={isInvited}
                        onChange={(e) => setFactionInvitation(name, e.target.checked)}
                        disabled={isLoading || isMember}
                      />
                      <Checkbox
                        label="Banned"
                        checked={isBanned}
                        onChange={(e) => updateFactionStats(name, { isBanned: e.target.checked })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
      {bulkValueModal && (
        <Modal
          isOpen={!!bulkValueModal}
          onClose={() => setBulkValueModal(null)}
          title={`Set ${bulkValueModal.type === 'reputation' ? 'Reputation' : 'Favor'}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setBulkValueModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmBulkValue}
                disabled={selectedCount === 0}
              >
                Apply to Selected
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-terminal-primary text-sm">
              Set {bulkValueModal.type === 'reputation' ? 'reputation' : 'favor'} for {selectedCount} selected faction(s).
            </p>
            <NumberInput
              label={bulkValueModal.type === 'reputation' ? 'Reputation Value' : 'Favor Value'}
              value={bulkValueModal.value}
              onChange={(value) => setBulkValueModal((prev) => (prev ? { ...prev, value } : prev))}
              showButtons={true}
              step={bulkValueModal.type === 'reputation' ? 1000 : 1}
              min={bulkValueModal.type === 'favor' ? 0 : undefined}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
