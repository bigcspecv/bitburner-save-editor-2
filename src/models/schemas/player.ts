import { z } from 'zod';
import { createCtorSchema, createJSONMapSchema, createJSONSetSchema } from './base';

/**
 * Player HP schema
 */
export const PlayerHPSchema = z.object({
  current: z.number(),
  max: z.number(),
});

/**
 * Player skills schema
 */
export const PlayerSkillsSchema = z.object({
  hacking: z.number(),
  strength: z.number(),
  defense: z.number(),
  dexterity: z.number(),
  agility: z.number(),
  charisma: z.number(),
  intelligence: z.number(),
});

/**
 * Player experience schema
 */
export const PlayerExpSchema = z.object({
  hacking: z.number(),
  strength: z.number(),
  defense: z.number(),
  dexterity: z.number(),
  agility: z.number(),
  charisma: z.number(),
  intelligence: z.number(),
});

/**
 * Player multipliers schema
 */
export const PlayerMultsSchema = z.object({
  hacking_chance: z.number(),
  hacking_speed: z.number(),
  hacking_money: z.number(),
  hacking_grow: z.number(),
  hacking: z.number(),
  hacking_exp: z.number(),
  strength: z.number(),
  strength_exp: z.number(),
  defense: z.number(),
  defense_exp: z.number(),
  dexterity: z.number(),
  dexterity_exp: z.number(),
  agility: z.number(),
  agility_exp: z.number(),
  charisma: z.number(),
  charisma_exp: z.number(),
  hacknet_node_money: z.number(),
  hacknet_node_purchase_cost: z.number(),
  hacknet_node_ram_cost: z.number(),
  hacknet_node_core_cost: z.number(),
  hacknet_node_level_cost: z.number(),
  company_rep: z.number(),
  faction_rep: z.number(),
  work_money: z.number(),
  crime_success: z.number(),
  crime_money: z.number(),
  bladeburner_max_stamina: z.number(),
  bladeburner_stamina_gain: z.number(),
  bladeburner_analysis: z.number(),
  bladeburner_success_chance: z.number(),
});

/**
 * Augmentation schema
 */
export const AugmentationSchema = z.object({
  name: z.string(),
  level: z.number(),
});

/**
 * Gang Member schema
 */
export const GangMemberSchema = createCtorSchema(
  'GangMember',
  z.object({
    name: z.string(),
    task: z.string(),
    earnedRespect: z.number(),
    hack: z.number(),
    str: z.number(),
    def: z.number(),
    dex: z.number(),
    agi: z.number(),
    cha: z.number(),
    hack_exp: z.number(),
    str_exp: z.number(),
    def_exp: z.number(),
    dex_exp: z.number(),
    agi_exp: z.number(),
    cha_exp: z.number(),
    hack_mult: z.number(),
    str_mult: z.number(),
    def_mult: z.number(),
    dex_mult: z.number(),
    agi_mult: z.number(),
    cha_mult: z.number(),
    hack_asc_points: z.number(),
    str_asc_points: z.number(),
    def_asc_points: z.number(),
    dex_asc_points: z.number(),
    agi_asc_points: z.number(),
    cha_asc_points: z.number(),
    upgrades: z.array(z.string()),
    augmentations: z.array(z.string()),
  })
);

/**
 * Gang schema
 */
export const GangSchema = createCtorSchema(
  'Gang',
  z.object({
    facName: z.string(),
    members: z.array(GangMemberSchema),
    wanted: z.number(),
    respect: z.number(),
    isHackingGang: z.boolean(),
    respectGainRate: z.number(),
    wantedGainRate: z.number(),
    moneyGainRate: z.number(),
    storedCycles: z.number(),
    storedTerritoryAndPowerCycles: z.number(),
    territoryClashChance: z.number(),
    territoryWarfareEngaged: z.boolean(),
    notifyMemberDeath: z.boolean(),
  })
);

/**
 * Hacknet Node schema
 */
export const HacknetNodeSchema = createCtorSchema(
  'HacknetNode',
  z.object({
    name: z.string(),
    level: z.number(),
    ram: z.number(),
    cores: z.number(),
    totalMoneyGenerated: z.number(),
    onlineTimeSeconds: z.number(),
    moneyGainRatePerSecond: z.number(),
  })
);

/**
 * Hash Manager schema
 */
export const HashManagerSchema = createCtorSchema(
  'HashManager',
  z.object({
    hashes: z.number(),
    capacity: z.number(),
    upgrades: z.record(z.string(), z.number()),
  })
);

/**
 * Money Source Tracker schema
 */
export const MoneySourceTrackerSchema = createCtorSchema(
  'MoneySourceTracker',
  z.object({
    total: z.number(),
    hacking: z.number(),
    hacknet: z.number(),
    hacknet_expenses: z.number(),
    augmentations: z.number(),
    work: z.number(),
    crime: z.number(),
    gang: z.number(),
    gang_expenses: z.number(),
    servers: z.number(),
    other: z.number(),
    bladeburner: z.number(),
    casino: z.number(),
    class: z.number(),
    codingcontract: z.number(),
    corporation: z.number(),
    infiltration: z.number(),
    sleeves: z.number(),
    stock: z.number(),
    hospitalization: z.number(),
  })
);

/**
 * Work schema - base type for different work types
 */
export const CompanyWorkSchema = createCtorSchema(
  'CompanyWork',
  z.object({
    type: z.literal('COMPANY'),
    singularity: z.boolean(),
    cyclesWorked: z.number(),
    companyName: z.string(),
  })
);

export const WorkSchema = z.union([
  CompanyWorkSchema,
  z.null(), // Player might not be working
]);

/**
 * Achievement schema
 */
export const AchievementSchema = z.object({
  ID: z.string(),
  unlockedOn: z.number(),
});

/**
 * Bit Node Options schema
 */
export const BitNodeOptionsSchema = z.object({
  sourceFileOverrides: createJSONMapSchema(z.number(), z.number()),
  restrictHomePCUpgrade: z.boolean(),
  disableGang: z.boolean(),
  disableCorporation: z.boolean(),
  disableBladeburner: z.boolean(),
  disable4SData: z.boolean(),
  disableHacknetServer: z.boolean(),
  disableSleeveExpAndAugmentation: z.boolean(),
});

/**
 * Complete Player schema
 */
export const PlayerDataSchema = z.object({
  hp: PlayerHPSchema,
  skills: PlayerSkillsSchema,
  exp: PlayerExpSchema,
  mults: PlayerMultsSchema,
  augmentations: z.array(AugmentationSchema),
  queuedAugmentations: z.array(AugmentationSchema),
  city: z.string(),
  bitNodeN: z.number(),
  corporation: z.null().or(z.unknown()), // TODO: Add corporation schema
  gang: GangSchema.or(z.null()),
  bladeburner: z.null().or(z.unknown()), // TODO: Add bladeburner schema
  currentServer: z.string(),
  factions: z.array(z.string()),
  factionInvitations: z.array(z.string()),
  factionRumors: createJSONSetSchema(z.string()).optional(),
  hacknetNodes: z.array(HacknetNodeSchema),
  has4SData: z.boolean(),
  has4SDataTixApi: z.boolean(),
  hashManager: HashManagerSchema,
  hasTixApiAccess: z.boolean(),
  hasWseAccount: z.boolean(),
  jobs: z.record(z.string(), z.string()), // company name -> job title
  karma: z.number(),
  numPeopleKilled: z.number(),
  location: z.string(),
  money: z.number(),
  moneySourceA: MoneySourceTrackerSchema,
  moneySourceB: MoneySourceTrackerSchema,
  playtimeSinceLastAug: z.number(),
  playtimeSinceLastBitnode: z.number(),
  lastAugReset: z.number(),
  lastNodeReset: z.number(),
  purchasedServers: z.array(z.string()),
  scriptProdSinceLastAug: z.number(),
  sleeves: z.array(z.unknown()), // TODO: Add sleeve schema
  sleevesFromCovenant: z.number(),
  sourceFiles: createJSONMapSchema(z.number(), z.number()),
  exploits: z.array(z.string()),
  achievements: z.array(AchievementSchema),
  terminalCommandHistory: z.array(z.string()),
  lastUpdate: z.number(),
  lastSave: z.number(),
  totalPlaytime: z.number(),
  currentWork: WorkSchema,
  focus: z.boolean(),
  entropy: z.number(),
  bitNodeOptions: BitNodeOptionsSchema,
  identifier: z.string(),
});

/**
 * Full Player save schema with ctor
 */
export const PlayerSaveSchema = createCtorSchema('PlayerObject', PlayerDataSchema);

export type PlayerHP = z.infer<typeof PlayerHPSchema>;
export type PlayerSkills = z.infer<typeof PlayerSkillsSchema>;
export type PlayerExp = z.infer<typeof PlayerExpSchema>;
export type PlayerMults = z.infer<typeof PlayerMultsSchema>;
export type Augmentation = z.infer<typeof AugmentationSchema>;
export type GangMember = z.infer<typeof GangMemberSchema>;
export type Gang = z.infer<typeof GangSchema>;
export type HacknetNode = z.infer<typeof HacknetNodeSchema>;
export type HashManager = z.infer<typeof HashManagerSchema>;
export type MoneySourceTracker = z.infer<typeof MoneySourceTrackerSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type BitNodeOptions = z.infer<typeof BitNodeOptionsSchema>;
export type PlayerData = z.infer<typeof PlayerDataSchema>;
export type PlayerSave = z.infer<typeof PlayerSaveSchema>;
