import { useCallback, useMemo, useState } from 'react';
import { Card, Input, NumberInput, Select, Button, ResetAction } from '../ui';
import { useSaveStore } from '../../store/save-store';
import { ALL_COMPANIES, COMPANY_JOBS, COMPANY_CITY_MAP, COMPANIES_WITH_FACTIONS } from '../../models/company-data';

type CityFilter = 'all' | 'Aevum' | 'Chongqing' | 'Ishima' | 'New Tokyo' | 'Sector-12' | 'Volhaven';
type StatusFilterKey = 'employed' | 'reputation' | 'changed' | 'hasFaction';

type FiltersState = {
  employed: boolean;
  reputation: boolean;
  changed: boolean;
  hasFaction: boolean;
  city: CityFilter;
};

const statusFilterButtons: Array<{ key: StatusFilterKey; label: string }> = [
  { key: 'employed', label: 'Employed Only' },
  { key: 'reputation', label: 'Has Reputation' },
  { key: 'changed', label: 'Modified Only' },
  { key: 'hasFaction', label: 'Has Faction' },
];

const cityOptions = [
  { value: 'all', label: 'All Cities' },
  { value: 'Aevum', label: 'Aevum' },
  { value: 'Chongqing', label: 'Chongqing' },
  { value: 'Ishima', label: 'Ishima' },
  { value: 'New Tokyo', label: 'New Tokyo' },
  { value: 'Sector-12', label: 'Sector-12' },
  { value: 'Volhaven', label: 'Volhaven' },
];

export function CompaniesSection() {
  const player = useSaveStore((state) => state.currentSave?.PlayerSave.data);
  const originalPlayer = useSaveStore((state) => state.originalSave?.PlayerSave.data);
  const companiesSave = useSaveStore((state) => state.currentSave?.CompaniesSave);
  const originalCompaniesSave = useSaveStore((state) => state.originalSave?.CompaniesSave);
  const updateCompanyStats = useSaveStore((state) => state.updateCompanyStats);
  const setCurrentJob = useSaveStore((state) => state.setCurrentJob);
  const resetCompany = useSaveStore((state) => state.resetCompany);
  const resetCompanies = useSaveStore((state) => state.resetCompanies);
  const hasCompanyChanges = useSaveStore((state) => state.hasCompanyChanges());
  const status = useSaveStore((state) => state.status);
  const isLoading = status === 'loading';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FiltersState>({
    employed: false,
    reputation: false,
    changed: false,
    hasFaction: false,
    city: 'all',
  });

  const companies = useMemo(() => {
    if (!player || !companiesSave) return [];

    // Start with all companies in the game
    const allCompanyNames = new Set(ALL_COMPANIES);

    // Add any companies from the save that might not be in our list
    Object.keys(companiesSave).forEach((name) => allCompanyNames.add(name));
    Object.keys(player.jobs).forEach((name) => allCompanyNames.add(name));

    return Array.from(allCompanyNames).map((name) => {
      const companyData = companiesSave[name] ?? { playerReputation: 0, favor: 0 };
      const originalCompanyData = originalCompaniesSave?.[name] ?? { playerReputation: 0, favor: 0 };
      const currentJob = player.jobs[name] ?? null;
      const originalJob = originalPlayer?.jobs[name] ?? null;

      // Check if company has changed
      const companyChanged =
        JSON.stringify({ ...companyData, job: currentJob }) !==
        JSON.stringify({ ...originalCompanyData, job: originalJob });

      return {
        name,
        playerReputation: companyData.playerReputation ?? 0,
        favor: companyData.favor ?? 0,
        currentJob,
        originalReputation: originalCompanyData.playerReputation ?? 0,
        originalFavor: originalCompanyData.favor ?? 0,
        originalJob,
        hasChanged: companyChanged,
        city: COMPANY_CITY_MAP[name] ?? 'Unknown',
      };
    });
  }, [player, companiesSave, originalCompaniesSave, originalPlayer]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Search filter
      if (search && !company.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Status filters
      if (filters.employed && !company.currentJob) return false;
      if (filters.reputation && company.playerReputation === 0) return false;
      if (filters.changed && !company.hasChanged) return false;
      if (filters.hasFaction && !COMPANIES_WITH_FACTIONS.has(company.name)) return false;

      // City filter
      if (filters.city !== 'all' && company.city !== filters.city) return false;

      return true;
    });
  }, [companies, search, filters]);

  const toggleFilter = useCallback((key: StatusFilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setFilters({
      employed: false,
      reputation: false,
      changed: false,
      hasFaction: false,
      city: 'all',
    });
  }, []);

  const hasActiveFilters = search !== '' || filters.employed || filters.reputation || filters.changed || filters.hasFaction || filters.city !== 'all';

  if (isLoading) {
    return (
      <div className="panel-terminal">
        <h2 className="text-xl mb-4 text-terminal-secondary">&gt; COMPANIES</h2>
        <p className="text-terminal-dim">Loading...</p>
      </div>
    );
  }

  if (!player || !companiesSave) {
    return (
      <div className="panel-terminal">
        <h2 className="text-xl mb-4 text-terminal-secondary">&gt; COMPANIES</h2>
        <p className="text-terminal-dim">No save file loaded.</p>
      </div>
    );
  }

  return (
    <div className="panel-terminal">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-terminal-secondary">&gt; COMPANIES</h2>
        <ResetAction
          hasChanges={hasCompanyChanges}
          onReset={resetCompanies}
          title="Reset All Companies"
        />
      </div>

      {/* Filters */}
      <Card className="mb-4" title="Filters">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Search and City Filter */}
          <div className="space-y-2">
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Search companies..."
              className="w-full"
            />
            <Select
              value={filters.city}
              onChange={(value) => setFilters((prev) => ({ ...prev, city: value as CityFilter }))}
              options={cityOptions}
              className="w-full"
            />
          </div>

          {/* Status Filters */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {statusFilterButtons.map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  variant={filters[key] ? 'primary' : 'secondary'}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="secondary" className="text-xs w-full">
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Company Count */}
      <div className="mb-4 text-sm text-terminal-dim">
        Showing {filteredCompanies.length} of {companies.length} companies
        {hasActiveFilters && ' (filtered)'}
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <p className="text-terminal-dim">No companies match the current filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.name}
              company={company}
              onUpdateStats={updateCompanyStats}
              onUpdateJob={setCurrentJob}
              onReset={resetCompany}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CompanyCardProps {
  company: {
    name: string;
    playerReputation: number;
    favor: number;
    currentJob: string | null;
    originalReputation: number;
    originalFavor: number;
    originalJob: string | null;
    hasChanged: boolean;
    city: string;
  };
  onUpdateStats: (name: string, updates: { playerReputation?: number; favor?: number }) => void;
  onUpdateJob: (companyName: string, jobTitle: string | null) => void;
  onReset: (name: string) => void;
}

function CompanyCard({ company, onUpdateStats, onUpdateJob, onReset }: CompanyCardProps) {
  const availableJobs = COMPANY_JOBS[company.name] ?? [];

  const jobOptions = [
    { value: '', label: '(No Job)' },
    ...availableJobs.map((job) => ({ value: job, label: job })),
  ];

  const handleReputationChange = useCallback(
    (value: number) => {
      onUpdateStats(company.name, { playerReputation: value });
    },
    [company.name, onUpdateStats]
  );

  const handleFavorChange = useCallback(
    (value: number) => {
      onUpdateStats(company.name, { favor: Math.min(35331, Math.max(0, value)) });
    },
    [company.name, onUpdateStats]
  );

  const handleJobChange = useCallback(
    (value: string) => {
      onUpdateJob(company.name, value === '' ? null : value);
    },
    [company.name, onUpdateJob]
  );

  const handleReset = useCallback(() => {
    onReset(company.name);
  }, [company.name, onReset]);

  const hasValues = company.playerReputation > 0 || company.favor > 0 || company.currentJob !== null;

  return (
    <Card
      title={company.name}
      subtitle={company.city}
      className={company.hasChanged ? 'border-terminal-secondary' : ''}
      actions={
        company.hasChanged ? (
          <Button onClick={handleReset} variant="warning" className="text-xs">
            Reset
          </Button>
        ) : null
      }
    >
      <div className="space-y-3">
        {/* Reputation */}
        <div>
          <label className="text-xs text-terminal-dim block mb-1">Reputation</label>
          <NumberInput
            value={company.playerReputation}
            onChange={handleReputationChange}
            min={0}
            className="w-full"
          />
        </div>

        {/* Favor */}
        <div>
          <label className="text-xs text-terminal-dim block mb-1">Favor</label>
          <NumberInput
            value={company.favor}
            onChange={handleFavorChange}
            min={0}
            max={35331}
            className="w-full"
          />
        </div>

        {/* Current Job */}
        {availableJobs.length > 0 && (
          <div>
            <label className="text-xs text-terminal-dim block mb-1">Current Job</label>
            <Select
              value={company.currentJob ?? ''}
              onChange={handleJobChange}
              options={jobOptions}
              className="w-full"
            />
          </div>
        )}

        {/* Status Badge */}
        {hasValues && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-terminal-dim">
            {company.currentJob && (
              <span className="text-xs px-2 py-0.5 bg-terminal-dim/30 text-terminal-primary">
                Employed
              </span>
            )}
            {company.playerReputation > 0 && (
              <span className="text-xs px-2 py-0.5 bg-terminal-dim/30 text-terminal-primary">
                Rep: {company.playerReputation.toLocaleString()}
              </span>
            )}
            {company.favor > 0 && (
              <span className="text-xs px-2 py-0.5 bg-terminal-dim/30 text-terminal-primary">
                Favor: {company.favor}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
