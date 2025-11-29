/**
 * Core save file types
 * Re-exports types from Zod schemas for convenience
 */

// Re-export all schema-based types
export * from './schemas';

// Save format type
export type SaveFormat = 'gzipped' | 'base64' | 'json';

// Augmentation types
export interface AugmentationMultipliers {
  hacking?: number;
  strength?: number;
  defense?: number;
  dexterity?: number;
  agility?: number;
  charisma?: number;
  hacking_exp?: number;
  strength_exp?: number;
  defense_exp?: number;
  dexterity_exp?: number;
  agility_exp?: number;
  charisma_exp?: number;
  hacking_chance?: number;
  hacking_speed?: number;
  hacking_money?: number;
  hacking_grow?: number;
  company_rep?: number;
  faction_rep?: number;
  crime_money?: number;
  crime_success?: number;
  work_money?: number;
  hacknet_node_money?: number;
  hacknet_node_purchase_cost?: number;
  hacknet_node_ram_cost?: number;
  hacknet_node_core_cost?: number;
  hacknet_node_level_cost?: number;
  bladeburner_max_stamina?: number;
  bladeburner_stamina_gain?: number;
  bladeburner_analysis?: number;
  bladeburner_success_chance?: number;
}

export interface AugmentationData {
  name: string;
  repCost: number;
  moneyCost: number;
  info: string;
  stats?: string;
  isSpecial?: boolean;
  factions: string[];
  multipliers: AugmentationMultipliers;
  prereqs?: string[];
}
