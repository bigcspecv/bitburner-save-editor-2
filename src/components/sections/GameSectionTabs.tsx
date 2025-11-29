import { useState } from 'react';
import { Card, ControlledTabs, type Tab } from '../ui';
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

const SECTION_TABS: Tab[] = [
  { id: 'player', label: 'Player', content: <PlayerSection /> },
  { id: 'augmentations', label: 'Augmentations', content: <AugmentationsSection /> },
  { id: 'factions', label: 'Factions', content: <FactionsSection /> },
  { id: 'companies', label: 'Companies', content: <CompaniesSection /> },
  { id: 'servers', label: 'Servers', content: <ServersSection /> },
  { id: 'gangs', label: 'Gangs', content: <GangsSection /> },
  { id: 'hacknet', label: 'Hacknet', content: <HacknetSection /> },
  { id: 'progression', label: 'Progression', content: <ProgressionSection /> },
  { id: 'business', label: 'Business', content: <BusinessSection /> },
  { id: 'stock-market', label: 'Stock Market', content: <StockMarketSection /> },
  { id: 'special', label: 'Special', content: <SpecialSection /> },
  { id: 'settings', label: 'Settings', content: <SettingsSection /> },
];

/**
  * Tabbed navigation for all game-centric editor sections.
  * Currently renders stub content for each section; swap with real editors as they ship.
  */
export function GameSectionTabs({ className }: GameSectionTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(SECTION_TABS[0]?.id ?? 'player');

  return (
    <Card
      title="Editor Sections"
      subtitle="Game-centric navigation scaffold"
      className={className}
    >
      <ControlledTabs
        tabs={SECTION_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Card>
  );
}

