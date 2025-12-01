/**
 * BitNode metadata extracted from Bitburner source code.
 * Contains names, taglines, descriptions, and difficulty ratings.
 */

export interface BitNodeMetadata {
  number: number;
  name: string;
  tagline: string;
  /** 0 = easy, 1 = medium, 2 = hard */
  difficulty: 0 | 1 | 2;
  description: string;
  sfDescription: string;
  /** Maximum level for this source file (3 for most, Infinity for SF12) */
  maxLevel: number;
}

/**
 * All BitNode metadata indexed by BitNode number.
 */
export const BITNODE_DATA: Record<number, BitNodeMetadata> = {
  1: {
    number: 1,
    name: 'Source Genesis',
    tagline: 'The original BitNode',
    difficulty: 0,
    description: 'This is the first BitNode created by the Enders to imprison the minds of humans. It became the prototype and testing ground for all of the BitNodes that followed. This is the first BitNode that you play through. It has no special modifications or mechanics.',
    sfDescription: 'This Source-File lets the player start with 32GB of RAM on their home computer when entering a new BitNode and increases all of the player\'s multipliers by: Level 1: 16%, Level 2: 24%, Level 3: 28%.',
    maxLevel: 3,
  },
  2: {
    number: 2,
    name: 'Rise of the Underworld',
    tagline: 'From the shadows, they rose',
    difficulty: 0,
    description: 'Organized crime groups quickly filled the void of power left behind from the collapse of Western government in the 2050s. Certain factions (Slum Snakes, Tetrads, The Syndicate, The Dark Army, Speakers for the Dead, NiteSec, and The Black Hand) give the player the ability to form and manage their own gang.',
    sfDescription: 'This Source-File allows you to form gangs in other BitNodes once your karma decreases to a certain value. It also increases your crime success rate, crime money, and charisma multipliers by: Level 1: 24%, Level 2: 36%, Level 3: 42%.',
    maxLevel: 3,
  },
  3: {
    number: 3,
    name: 'Corporatocracy',
    tagline: 'The Price of Civilization',
    difficulty: 2,
    description: 'Sometime in the early 21st century, economic and political globalization turned the world into a corporatocracy. In this BitNode, you can create and manage your own corporation with the potential to generate massive profits.',
    sfDescription: 'This Source-File lets you create corporations on other BitNodes and level 3 permanently unlocks the full API. Increases charisma and company salary multipliers by: Level 1: 8%, Level 2: 12%, Level 3: 14%.',
    maxLevel: 3,
  },
  4: {
    number: 4,
    name: 'The Singularity',
    tagline: 'The Man and the Machine',
    difficulty: 1,
    description: 'The Singularity has arrived. In this BitNode, you gain access to Singularity functions that allow you to control most aspects of the game through scripts, including working for factions/companies, purchasing/installing augmentations, and creating programs.',
    sfDescription: 'This Source-File lets you access and use the Singularity functions outside of this BitNode. Each level reduces the RAM cost of singularity functions: Level 1: 16x, Level 2: 4x, Level 3: 1x.',
    maxLevel: 3,
  },
  5: {
    number: 5,
    name: 'Artificial Intelligence',
    tagline: 'Posthuman',
    difficulty: 1,
    description: 'They said the human brain, along with its consciousness and intelligence, couldn\'t be replicated. They were wrong.',
    sfDescription: 'This Source-File grants you a new stat called Intelligence. It is permanent and persistent (never gets reset). Also unlocks getBitNodeMultipliers(), permanent Formulas.exe access, and BitNode multiplier info on the Stats page. Raises hacking multipliers by: Level 1: 8%, Level 2: 12%, Level 3: 14%.',
    maxLevel: 3,
  },
  6: {
    number: 6,
    name: 'Bladeburners',
    tagline: 'Like Tears in Rain',
    difficulty: 1,
    description: 'In the middle of the 21st century, OmniTek Incorporated developed the MK-VI Synthoid with hyper-intelligent AI. In this BitNode, you can access the Bladeburner division at the NSA.',
    sfDescription: 'This Source-File allows you to access the NSA\'s Bladeburner division in other BitNodes. Raises combat stat levels and experience gain by: Level 1: 8%, Level 2: 12%, Level 3: 14%.',
    maxLevel: 3,
  },
  7: {
    number: 7,
    name: 'Bladeburners 2079',
    tagline: 'More human than humans',
    difficulty: 2,
    description: 'In the middle of the 21st century, you were doing cutting-edge work at OmniTek Incorporated on the MK-VI Synthoid AI. In this BitNode, you can access the Bladeburner division at the NSA.',
    sfDescription: 'This Source-File allows you to access the NSA\'s Bladeburner division. Increases all Bladeburner multipliers by: Level 1: 8%, Level 2: 12%, Level 3: 14% and immediately receive "Blade\'s Simulacrum" augmentation.',
    maxLevel: 3,
  },
  8: {
    number: 8,
    name: 'Ghost of Wall Street',
    tagline: 'Money never sleeps',
    difficulty: 2,
    description: 'You are trying to make a name for yourself as an up-and-coming hedge fund manager on Wall Street. You start with $250 million, WSE membership, TIX API access, and can short stocks and place limit/stop orders.',
    sfDescription: 'Level 1: Permanent access to WSE and TIX API. Level 2: Ability to short stocks. Level 3: Ability to use limit/stop orders. Also increases hacking growth multipliers by: Level 1: 12%, Level 2: 18%, Level 3: 21%.',
    maxLevel: 3,
  },
  9: {
    number: 9,
    name: 'Hacktocracy',
    tagline: 'Hacknet Unleashed',
    difficulty: 2,
    description: 'When Fulcrum Secret Technologies released their open-source Linux distro Chapeau, it became the OS of choice for the underground hacking community. This BitNode unlocks Hacknet Servers, an upgraded version of Hacknet Nodes that generate hashes.',
    sfDescription: 'Level 1: Permanently unlocks Hacknet Server. Level 2: Start with 128GB of RAM on home computer. Level 3: Grants a highly-upgraded Hacknet Server when entering a new BitNode. Increases hacknet production and reduces costs by: Level 1: 12%, Level 2: 18%, Level 3: 21%.',
    maxLevel: 3,
  },
  10: {
    number: 10,
    name: 'Digital Carbon',
    tagline: 'Your body is not who you are',
    difficulty: 2,
    description: 'In 2084, VitaLife unveiled the Persona Core, allowing people to digitize their consciousness. This BitNode unlocks Sleeve technology (duplicate consciousness into Synthoids) and Grafting (alternative augmentation installation).',
    sfDescription: 'This Source-File unlocks Sleeve and Grafting API in other BitNodes. Each level grants you an additional Sleeve.',
    maxLevel: 3,
  },
  11: {
    number: 11,
    name: 'The Big Crash',
    tagline: 'Okay. Sell it all.',
    difficulty: 1,
    description: 'The 2050s was defined by violent civil unrest. Financial catastrophes hit as governments bankrupted and hackers stole billions, prompting an international banking crisis. The world is crumbling in the biggest economic crisis of all time.',
    sfDescription: 'This Source-File makes company favor increase BOTH salary and reputation gain rate by 1% per favor. Increases company salary and reputation gain by: Level 1: 32%, Level 2: 48%, Level 3: 56%. Reduces augmentation price increase by: Level 1: 4%, Level 2: 6%, Level 3: 7%.',
    maxLevel: 3,
  },
  12: {
    number: 12,
    name: 'The Recursion',
    tagline: 'Repeat.',
    difficulty: 0,
    description: 'To iterate is human; to recurse, divine. Every time this BitNode is destroyed, it becomes slightly harder. There is no maximum level for Source-File 12.',
    sfDescription: 'This Source-File lets you start any BitNodes with Neuroflux Governor equal to the level of this Source-File.',
    maxLevel: Infinity,
  },
  13: {
    number: 13,
    name: "They're lunatics",
    tagline: '1 step back, 2 steps forward',
    difficulty: 2,
    description: 'With the invention of augmentations in the 2040s, the Church of the Machine God has rallied support. Their leader, Allison "Mother" Stanek, is said to have created her own augmentation whose power goes beyond any other. Find her in Chongqing.',
    sfDescription: 'This Source-File lets the Church of the Machine God appear in other BitNodes. Each level increases the size of Stanek\'s Gift. Note: Due to SF7.3, you must accept Stanek\'s Gift before joining Bladeburner division.',
    maxLevel: 3,
  },
  14: {
    number: 14,
    name: 'IPvGO Subnet Takeover',
    tagline: 'Territory exists only in the \'net',
    difficulty: 1,
    description: 'In late 2070, the .org bubble burst, and most of the IPvGO \'net collapsed overnight. Various factions have been fighting over small subnets to control their computational power. Prevent their attempts to destroy your networks by controlling the open space!',
    sfDescription: 'Level 1: 100% increased stat multipliers from Node Power. Level 2: Permanently unlocks the go.cheat API. Level 3: 25% additive increased success rate for go.cheat API. Also increases maximum favor from winstreaks.',
    maxLevel: 3,
  },
};

/**
 * Get the difficulty label for a BitNode difficulty value.
 */
export function getDifficultyLabel(difficulty: 0 | 1 | 2): string {
  switch (difficulty) {
    case 0: return 'Easy';
    case 1: return 'Medium';
    case 2: return 'Hard';
  }
}

/**
 * Get the CSS class for difficulty styling.
 */
export function getDifficultyClass(difficulty: 0 | 1 | 2): string {
  switch (difficulty) {
    case 0: return 'text-green-400';
    case 1: return 'text-yellow-400';
    case 2: return 'text-red-400';
  }
}

/**
 * Get all BitNode numbers in order (1-14).
 */
export function getAllBitNodeNumbers(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
}

/**
 * Get metadata for a specific BitNode.
 */
export function getBitNodeMetadata(n: number): BitNodeMetadata | undefined {
  return BITNODE_DATA[n];
}
