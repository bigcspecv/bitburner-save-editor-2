import { z } from 'zod';

/**
 * Company schema - represents a company in the game
 */
export const CompanySchema = z.object({
  playerReputation: z.number(),
  favor: z.number().optional(),
  isPlayerEmployed: z.boolean().optional(),
});

/**
 * All companies save - maps company name to Company
 */
export const CompaniesSaveSchema = z.record(z.string(), CompanySchema);

export type Company = z.infer<typeof CompanySchema>;
export type CompaniesSave = z.infer<typeof CompaniesSaveSchema>;
