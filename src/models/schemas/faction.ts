import { z } from 'zod';

/**
 * Faction discovery status
 */
export const FactionDiscoverySchema = z.enum(['known', 'unknown', 'rumor']);

/**
 * Faction schema - represents a faction in the game
 */
export const FactionSchema = z.object({
  discovery: FactionDiscoverySchema,
  favor: z.number().optional(),
  playerReputation: z.number().optional(),
  alreadyInvited: z.boolean().optional(),
  isBanned: z.boolean().optional(),
});

/**
 * All factions save - maps faction name to Faction
 */
export const FactionsSaveSchema = z.record(z.string(), FactionSchema);

export type FactionDiscovery = z.infer<typeof FactionDiscoverySchema>;
export type Faction = z.infer<typeof FactionSchema>;
export type FactionsSave = z.infer<typeof FactionsSaveSchema>;
