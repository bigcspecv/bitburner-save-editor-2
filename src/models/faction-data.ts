/**
 * Faction metadata extracted from Bitburner v2.6.2+ source
 *
 * This file contains comprehensive faction metadata including:
 * - Work types (hacking, field, security)
 * - Enemy relationships
 * - Associated cities
 * - Associated companies
 * - Faction categories
 * - Join requirements (human-readable summaries)
 *
 * Source: .bitburner-src-dev/src/Faction/FactionInfo.tsx
 */

export type FactionCategory =
  | 'Early Game'
  | 'City'
  | 'Hacker Group'
  | 'Megacorporation'
  | 'Criminal'
  | 'Endgame'
  | 'Special';

export interface FactionMetadata {
  /** Faction category for grouping */
  category?: FactionCategory;
  /** Cities where this faction is located */
  cities?: string[];
  /** Company associated with this faction (for corporate factions) */
  company?: string;
  /** Factions that are enemies with this faction */
  enemies?: string[];
  /** Whether this faction offers hacking work */
  offerHackingWork?: boolean;
  /** Whether this faction offers field work */
  offerFieldWork?: boolean;
  /** Whether this faction offers security work */
  offerSecurityWork?: boolean;
  /** Human-readable join requirements */
  requirements?: string[];
}

/**
 * Faction metadata mapping
 */
export const FACTION_DATA: Record<string, FactionMetadata> = {
  // ===== EARLY GAME FACTIONS =====
  'CyberSec': {
    category: 'Early Game',
    offerHackingWork: true,
    requirements: ['Install a backdoor on the CSEC server'],
  },
  'Tian Di Hui': {
    category: 'Early Game',
    cities: ['Chongqing', 'New Tokyo', 'Ishima'],
    offerHackingWork: true,
    offerSecurityWork: true,
    requirements: ['Be in Chongqing, New Tokyo, or Ishima', '$1m', 'Hacking 50'],
  },
  'Netburners': {
    category: 'Early Game',
    offerHackingWork: true,
    requirements: ['Hacking 80', '8 GB total Hacknet RAM', '4 total Hacknet cores', '100 total Hacknet levels'],
  },
  'Slum Snakes': {
    category: 'Early Game',
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['$1m', 'All combat stats 30', 'Karma -9', 'Not work for CIA or NSA'],
  },

  // ===== CITY FACTIONS =====
  'Sector-12': {
    category: 'City',
    cities: ['Sector-12'],
    enemies: ['Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Be in Sector-12', '$15m'],
  },
  'Aevum': {
    category: 'City',
    cities: ['Aevum'],
    enemies: ['Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Be in Aevum', '$40m'],
  },
  'Volhaven': {
    category: 'City',
    cities: ['Volhaven'],
    enemies: ['Chongqing', 'Sector-12', 'New Tokyo', 'Aevum', 'Ishima'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Be in Volhaven', '$50m'],
  },
  'Chongqing': {
    category: 'City',
    cities: ['Chongqing'],
    enemies: ['Sector-12', 'Aevum', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Be in Chongqing', '$20m'],
  },
  'New Tokyo': {
    category: 'City',
    cities: ['New Tokyo'],
    enemies: ['Sector-12', 'Aevum', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Be in New Tokyo', '$20m'],
  },
  'Ishima': {
    category: 'City',
    cities: ['Ishima'],
    enemies: ['Sector-12', 'Aevum', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Be in Ishima', '$30m'],
  },

  // ===== HACKER GROUPS =====
  'NiteSec': {
    category: 'Hacker Group',
    offerHackingWork: true,
    requirements: ['Install a backdoor on the avmnite-02h server'],
  },
  'The Black Hand': {
    category: 'Hacker Group',
    offerHackingWork: true,
    offerFieldWork: true,
    requirements: ['Install a backdoor on the I.I.I.I server'],
  },
  'BitRunners': {
    category: 'Hacker Group',
    offerHackingWork: true,
    requirements: ['Install a backdoor on the run4theh111z server'],
  },

  // ===== MEGACORPORATIONS =====
  'ECorp': {
    category: 'Megacorporation',
    company: 'ECorp',
    cities: ['Aevum'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for ECorp', '400k company reputation'],
  },
  'MegaCorp': {
    category: 'Megacorporation',
    company: 'MegaCorp',
    cities: ['Sector-12'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for MegaCorp', '400k company reputation'],
  },
  'KuaiGong International': {
    category: 'Megacorporation',
    company: 'KuaiGong International',
    cities: ['Chongqing'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for KuaiGong International', '400k company reputation'],
  },
  'Four Sigma': {
    category: 'Megacorporation',
    company: 'Four Sigma',
    cities: ['Sector-12'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for Four Sigma', '400k company reputation'],
  },
  'NWO': {
    category: 'Megacorporation',
    company: 'NWO',
    cities: ['Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for NWO', '400k company reputation'],
  },
  'Blade Industries': {
    category: 'Megacorporation',
    company: 'Blade Industries',
    cities: ['Sector-12'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for Blade Industries', '400k company reputation'],
  },
  'OmniTek Incorporated': {
    category: 'Megacorporation',
    company: 'OmniTek Incorporated',
    cities: ['Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for OmniTek Incorporated', '400k company reputation'],
  },
  'Bachman & Associates': {
    category: 'Megacorporation',
    company: 'Bachman & Associates',
    cities: ['Aevum'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for Bachman & Associates', '400k company reputation'],
  },
  'Clarke Incorporated': {
    category: 'Megacorporation',
    company: 'Clarke Incorporated',
    cities: ['Aevum'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Work for Clarke Incorporated', '400k company reputation'],
  },
  'Fulcrum Secret Technologies': {
    category: 'Megacorporation',
    company: 'Fulcrum Technologies',
    cities: ['Aevum'],
    offerHackingWork: true,
    offerSecurityWork: true,
    requirements: ['Work for Fulcrum Technologies', '400k company reputation', 'Install backdoor on fulcrumassets server'],
  },

  // ===== CRIMINAL ORGANIZATIONS =====
  'Speakers for the Dead': {
    category: 'Criminal',
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: [
      'Not work for CIA or NSA',
      'Hacking 100',
      'All combat stats 300',
      '30 people killed',
      'Karma -45',
    ],
  },
  'The Dark Army': {
    category: 'Criminal',
    cities: ['Chongqing'],
    offerHackingWork: true,
    offerFieldWork: true,
    requirements: [
      'Be in Chongqing',
      'Not work for CIA or NSA',
      'Hacking 300',
      'All combat stats 300',
      '5 people killed',
      'Karma -45',
    ],
  },
  'The Syndicate': {
    category: 'Criminal',
    cities: ['Aevum', 'Sector-12'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: [
      'Be in Aevum or Sector-12',
      'Not work for CIA or NSA',
      '$10m',
      'Hacking 200',
      'All combat stats 200',
      'Karma -90',
    ],
  },
  'Silhouette': {
    category: 'Criminal',
    offerHackingWork: true,
    offerFieldWork: true,
    requirements: ['CTO, CFO, or CEO of a company', '$15m', 'Karma -22'],
  },
  'Tetrads': {
    category: 'Criminal',
    cities: ['Chongqing', 'New Tokyo', 'Ishima'],
    offerFieldWork: true,
    offerSecurityWork: true,
    requirements: ['Be in Chongqing, New Tokyo, or Ishima', 'All combat stats 75', 'Karma -18'],
  },

  // ===== ENDGAME FACTIONS =====
  'The Covenant': {
    category: 'Endgame',
    offerHackingWork: true,
    offerFieldWork: true,
    requirements: ['20 augmentations', '$75b', 'Hacking 850', 'All combat stats 850'],
  },
  'Daedalus': {
    category: 'Endgame',
    offerHackingWork: true,
    offerFieldWork: true,
    requirements: ['30 augmentations (varies by BitNode)', '$100b', 'Hacking 2500 OR all combat stats 1500'],
  },
  'Illuminati': {
    category: 'Endgame',
    offerHackingWork: true,
    offerFieldWork: true,
    requirements: ['30 augmentations', '$150b', 'Hacking 1500', 'All combat stats 1200'],
  },

  // ===== SPECIAL FACTIONS =====
  'Bladeburners': {
    category: 'Special',
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
    requirements: ['Source-File 6 or 7', 'Bladeburner rank 25'],
  },
  'Church of the Machine God': {
    category: 'Special',
    cities: ['Chongqing'],
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
    requirements: ['Source-File 13', 'No augmentations installed', 'Visit the church in Chongqing'],
  },
  'Shadows of Anarchy': {
    category: 'Special',
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
    requirements: ['Complete an infiltration'],
  },
};

/**
 * Get faction metadata for a given faction name
 * Returns default (no metadata) if faction not found
 */
export function getFactionMetadata(factionName: string): FactionMetadata {
  return FACTION_DATA[factionName] ?? {
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
  };
}

/**
 * Check if a faction offers any type of work
 */
export function offersWork(factionName: string): boolean {
  const metadata = getFactionMetadata(factionName);
  return !!(
    metadata.offerHackingWork ||
    metadata.offerFieldWork ||
    metadata.offerSecurityWork
  );
}

/**
 * Get all factions in a specific category
 */
export function getFactionsByCategory(category: FactionCategory): string[] {
  return Object.entries(FACTION_DATA)
    .filter(([_, metadata]) => metadata.category === category)
    .map(([name]) => name);
}

/**
 * Get all factions located in a specific city
 */
export function getFactionsByCity(city: string): string[] {
  return Object.entries(FACTION_DATA)
    .filter(([_, metadata]) => metadata.cities?.includes(city))
    .map(([name]) => name);
}

/**
 * Get all company-affiliated factions
 */
export function getCompanyFactions(): string[] {
  return Object.entries(FACTION_DATA)
    .filter(([_, metadata]) => metadata.company !== undefined)
    .map(([name]) => name);
}

/**
 * Get all unique cities that have associated factions
 * Returns sorted array of city names
 */
export function getAllCities(): string[] {
  const cities = new Set<string>();
  Object.values(FACTION_DATA).forEach((metadata) => {
    metadata.cities?.forEach((city) => cities.add(city));
  });
  return Array.from(cities).sort();
}
