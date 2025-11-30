import { useState, useMemo } from 'react';
import { Card, ControlledTabs, type Tab } from '../ui';
import { useSaveStore } from '../../store/save-store';
import { AugmentationsSection } from './AugmentationsSection';
import { BusinessSection } from './BusinessSection';
import { CompaniesSection } from './CompaniesSection';
import { FactionsSection } from './FactionsSection';
import { GangsSection } from './GangsSection';
import { HacknetSection } from './HacknetSection';
import { PlayerSection } from './PlayerSection';
import { ProgressionSection } from './ProgressionSection';
import { ServersSection } from './ServersSection';
import { SettingsSection } from './SettingsSection';
import { SpecialSection } from './SpecialSection';
import { StockMarketSection } from './StockMarketSection';

interface GameSectionTabsProps {
  className?: string;
}

/**
  * Tabbed navigation for all game-centric editor sections.
  * Currently renders stub content for each section; swap with real editors as they ship.
  */
export function GameSectionTabs({ className }: GameSectionTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('player');

  // Subscribe to currentSave so we re-render when changes occur
  const currentSave = useSaveStore((s) => s.currentSave);
  const hasPlayerStatChanges = useSaveStore((s) => s.hasPlayerStatChanges);
  const hasPlayerResourceChanges = useSaveStore((s) => s.hasPlayerResourceChanges);
  const hasAugmentationChanges = useSaveStore((s) => s.hasAugmentationChanges);
  const hasFactionChanges = useSaveStore((s) => s.hasFactionChanges);
  const hasCompanyChanges = useSaveStore((s) => s.hasCompanyChanges);
  const hasServerChanges = useSaveStore((s) => s.hasServerChanges);
  const hasGangChanges = useSaveStore((s) => s.hasGangChanges);

  const sectionTabs: Tab[] = useMemo(() => [
    { id: 'player', label: 'Player', content: <PlayerSection />, hasChanges: hasPlayerStatChanges() || hasPlayerResourceChanges() },
    { id: 'augmentations', label: 'Augmentations', content: <AugmentationsSection />, hasChanges: hasAugmentationChanges() },
    { id: 'factions', label: 'Factions', content: <FactionsSection />, hasChanges: hasFactionChanges() },
    { id: 'companies', label: 'Companies', content: <CompaniesSection />, hasChanges: hasCompanyChanges() },
    { id: 'servers', label: 'Servers', content: <ServersSection />, hasChanges: hasServerChanges() },
    { id: 'gangs', label: 'Gangs', content: <GangsSection />, hasChanges: hasGangChanges() },
    { id: 'hacknet', label: 'Hacknet', content: <HacknetSection /> },
    { id: 'progression', label: 'Progression', content: <ProgressionSection /> },
    { id: 'business', label: 'Business', content: <BusinessSection /> },
    { id: 'stock-market', label: 'Stock Market', content: <StockMarketSection /> },
    { id: 'special', label: 'Special', content: <SpecialSection /> },
    { id: 'settings', label: 'Settings', content: <SettingsSection /> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [currentSave]);

  return (
    <Card className={className}>
      <ControlledTabs
        tabs={sectionTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Card>
  );
}

