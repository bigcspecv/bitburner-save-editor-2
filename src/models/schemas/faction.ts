import { z } from 'zod';

/**
 * Faction discovery status
 *
 * Some saves use "rumored" instead of "rumor" (observed in 2.8.1+ saves),
 * so we normalize both to "rumored" to keep the type narrow.
 */
export const FactionDiscoverySchema = z.preprocess(
  (value) => (value === 'rumor' ? 'rumored' : value),
  z.enum(['known', 'unknown', 'rumored'])
);

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
