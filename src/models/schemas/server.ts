import { z } from 'zod';
import { createCtorSchema, createJSONMapSchema } from './base';

/**
 * Script schema - represents a script file on a server
 */
export const ScriptSchema = createCtorSchema(
  'Script',
  z.object({
    filename: z.string(),
    code: z.string(),
    server: z.string(),
  })
);

/**
 * Server schema - represents a server in the game
 */
export const ServerDataSchema = z.object({
  hostname: z.string(),
  ip: z.string(),
  organizationName: z.string(),
  isConnectedTo: z.boolean(),
  hasAdminRights: z.boolean(),

  // RAM
  maxRam: z.number(),

  // Ports
  ftpPortOpen: z.boolean(),
  httpPortOpen: z.boolean(),
  smtpPortOpen: z.boolean().optional(),
  sqlPortOpen: z.boolean().optional(),
  sshPortOpen: z.boolean().optional(),

  // Security
  baseDifficulty: z.number().optional(),
  hackDifficulty: z.number().optional(),
  minDifficulty: z.number().optional(),
  serverGrowth: z.number().optional(),

  // Money
  moneyAvailable: z.number().optional(),
  moneyMax: z.number().optional(),

  // Admin rights
  requiredHackingSkill: z.number().optional(),
  numOpenPortsRequired: z.number().optional(),

  // Backdoor
  backdoorInstalled: z.boolean().optional(),

  // CPU cores
  cpuCores: z.number(),

  // Files
  scripts: createJSONMapSchema(z.string(), ScriptSchema),
  messages: z.array(z.string()),
  programs: z.array(z.string()),
  contracts: z.array(z.unknown()), // TODO: Add contract schema
  textFiles: createJSONMapSchema(z.string(), z.unknown()).optional(),

  // Runtime state
  runningScripts: z.array(z.unknown()).optional(),
  serversOnNetwork: z.array(z.string()).optional(),
  openPortCount: z.number().optional(),

  // Purchased server
  purchasedByPlayer: z.boolean().optional(),
});

/**
 * Full Server schema with ctor
 */
export const ServerSchema = createCtorSchema('Server', ServerDataSchema);

/**
 * All servers save - maps hostname to Server
 */
export const AllServersSaveSchema = z.record(z.string(), ServerSchema);

export type Script = z.infer<typeof ScriptSchema>;
export type ServerData = z.infer<typeof ServerDataSchema>;
export type Server = z.infer<typeof ServerSchema>;
export type AllServersSave = z.infer<typeof AllServersSaveSchema>;
