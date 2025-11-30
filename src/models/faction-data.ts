/**
 * Faction metadata extracted from Bitburner v2.6.2+ source
 *
 * This file contains faction work types and enemy relationships.
 * Source: .bitburner-src-dev/src/Faction/FactionInfo.tsx
 */

export interface FactionMetadata {
  /** Factions that are enemies with this faction */
  enemies?: string[];
  /** Whether this faction offers hacking work */
  offerHackingWork?: boolean;
  /** Whether this faction offers field work */
  offerFieldWork?: boolean;
  /** Whether this faction offers security work */
  offerSecurityWork?: boolean;
}

/**
 * Faction metadata mapping
 * Only includes factions with non-default metadata (enemies or specific work types)
 */
export const FACTION_DATA: Record<string, FactionMetadata> = {
  // Endgame factions
  'Illuminati': {
    offerHackingWork: true,
    offerFieldWork: true,
  },
  'Daedalus': {
    offerHackingWork: true,
    offerFieldWork: true,
  },
  'The Covenant': {
    offerHackingWork: true,
    offerFieldWork: true,
  },

  // Megacorporations
  'ECorp': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'MegaCorp': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Bachman & Associates': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Blade Industries': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'NWO': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Clarke Incorporated': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'OmniTek Incorporated': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Four Sigma': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'KuaiGong International': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },

  // Other corporations
  'Fulcrum Secret Technologies': {
    offerHackingWork: true,
    offerSecurityWork: true,
  },

  // Hacker groups
  'BitRunners': {
    offerHackingWork: true,
  },
  'The Black Hand': {
    offerHackingWork: true,
    offerFieldWork: true,
  },
  'NiteSec': {
    offerHackingWork: true,
  },
  'CyberSec': {
    offerHackingWork: true,
  },

  // City factions (with enemies)
  'Aevum': {
    enemies: ['Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Chongqing': {
    enemies: ['Sector-12', 'Aevum', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Ishima': {
    enemies: ['Sector-12', 'Aevum', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'New Tokyo': {
    enemies: ['Sector-12', 'Aevum', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Sector-12': {
    enemies: ['Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Volhaven': {
    enemies: ['Chongqing', 'Sector-12', 'New Tokyo', 'Aevum', 'Ishima'],
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },

  // Criminal organizations
  'Speakers for the Dead': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'The Dark Army': {
    offerHackingWork: true,
    offerFieldWork: true,
  },
  'The Syndicate': {
    offerHackingWork: true,
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Silhouette': {
    offerHackingWork: true,
    offerFieldWork: true,
  },
  'Tetrads': {
    offerFieldWork: true,
    offerSecurityWork: true,
  },
  'Slum Snakes': {
    offerFieldWork: true,
    offerSecurityWork: true,
  },

  // Early game factions
  'Netburners': {
    offerHackingWork: true,
  },
  'Tian Di Hui': {
    offerHackingWork: true,
    offerSecurityWork: true,
  },

  // Special factions (no work offered through normal means)
  'Bladeburners': {
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
  },
  'Church of the Machine God': {
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
  },
  'Shadows of Anarchy': {
    offerHackingWork: false,
    offerFieldWork: false,
    offerSecurityWork: false,
  },
};

/**
 * Get faction metadata for a given faction name
 * Returns default (no enemies, no work) if faction not found
 */
export function getFactionMetadata(factionName: string): FactionMetadata {
  return FACTION_DATA[factionName] ?? {
    enemies: [],
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
