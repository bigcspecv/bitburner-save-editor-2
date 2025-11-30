import { useMemo, useState } from 'react';
import { Card, Input, NumberInput, Checkbox, Button, Select, ResetAction } from '../ui';
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
  const [filters, setFilters] = useState({
    members: false,
    invited: false,
    changed: false,
    discovery: 'all' as DiscoveryFilter,
  });

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
      if (query && !faction.name.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.members && !faction.isMember) return false;
      if (filters.invited && !faction.isInvited) return false;
      if (filters.changed && !faction.changed) return false;
      if (filters.discovery !== 'all' && faction.faction.discovery !== filters.discovery) return false;
      return true;
    });
  }, [factions, search, filters]);

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
            {(search || filters.members || filters.invited || filters.changed || filters.discovery !== 'all') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setFilters({ members: false, invited: false, changed: false, discovery: 'all' });
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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

            <div className="self-end text-terminal-dim text-xs font-mono">
              <p>&gt; Filtered results: {filteredFactions.length} / {factions.length}</p>
              <p>&gt; Banned factions: {bannedCount}</p>
            </div>
          </div>
        </div>

        {filteredFactions.length === 0 ? (
          <p className="text-terminal-dim text-sm text-center py-8">
            {search || filters.members || filters.invited || filters.changed || filters.discovery !== 'all'
              ? 'No factions match your filters'
              : 'No factions found in this save'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
            {filteredFactions.map(({ name, faction, isMember, isInvited, changed }) => {
              const favor = faction.favor ?? 0;
              const reputation = faction.playerReputation ?? 0;
              const discovery = faction.discovery ?? 'unknown';
              const isBanned = faction.isBanned ?? false;

              return (
                <div
                  key={name}
                  className={`border p-3 bg-black ${changed ? 'border-terminal-secondary' : 'border-terminal-primary/40'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-terminal-secondary uppercase tracking-wide text-lg">
                        {name}
                      </h3>
                      <p className="text-terminal-dim text-xs">
                        Discovery: {discovery}
                      </p>
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
  );
}
