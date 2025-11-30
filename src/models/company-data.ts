// All companies in the game that can have reputation/favor
export const ALL_COMPANIES = [
  // Aevum
  "AeroCorp",
  "Bachman & Associates",
  "Clarke Incorporated",
  "ECorp",
  "Fulcrum Technologies",
  "Galactic Cybersystems",
  "NetLink Technologies",
  "Rho Construction",
  "Watchdog Security",

  // Chongqing
  "KuaiGong International",
  "Solaris Space Systems",

  // Sector-12
  "Alpha Enterprises",
  "Blade Industries",
  "Carmichael Security",
  "Central Intelligence Agency",
  "DeltaOne",
  "FoodNStuff",
  "Four Sigma",
  "Icarus Microsystems",
  "Joe's Guns",
  "MegaCorp",
  "National Security Agency",
  "Universal Energy",

  // New Tokyo
  "DefComm",
  "Global Pharmaceuticals",
  "Noodle Bar",
  "VitaLife",

  // Ishima
  "Nova Medical",
  "Omega Software",
  "Storm Technologies",
  "0x6C1",

  // Volhaven
  "CompuTek",
  "Helios Labs",
  "LexoCorp",
  "NWO",
  "OmniTek Incorporated",
  "Omnia Cybersystems",
  "SysCore Securities",
] as const;

// All job titles in the game
export const ALL_JOB_TITLES = [
  "Software Engineering Intern",
  "Junior Software Engineer",
  "Senior Software Engineer",
  "Lead Software Developer",
  "Head of Software",
  "Head of Engineering",
  "Vice President of Technology",
  "Chief Technology Officer",
  "IT Intern",
  "IT Analyst",
  "IT Manager",
  "Systems Administrator",
  "Security Engineer",
  "Network Engineer",
  "Network Administrator",
  "Business Intern",
  "Business Analyst",
  "Business Manager",
  "Operations Manager",
  "Chief Financial Officer",
  "Chief Executive Officer",
  "Security Guard",
  "Security Officer",
  "Security Supervisor",
  "Head of Security",
  "Field Agent",
  "Secret Agent",
  "Special Operative",
  "Employee",
  "Part-time Employee",
  "Waiter",
  "Part-time Waiter",
  "Software Consultant",
  "Senior Software Consultant",
  "Business Consultant",
  "Senior Business Consultant",
] as const;

// Mapping of companies to their available job positions
export const COMPANY_JOBS: Record<string, readonly string[]> = {
  // Mega Corporations - All jobs
  "ECorp": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],
  "MegaCorp": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],

  // High-tier corporations
  "Bachman & Associates": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],
  "Blade Industries": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],
  "NWO": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],
  "Clarke Incorporated": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],
  "OmniTek Incorporated": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],
  "Four Sigma": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],
  "KuaiGong International": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering", "Vice President of Technology", "Chief Technology Officer",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager", "Chief Financial Officer", "Chief Executive Officer",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],

  // Tech companies with consulting
  "Fulcrum Technologies": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager",
  ],
  "Storm Technologies": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "DefComm": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Helios Labs": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer",
    "Software Consultant", "Senior Software Consultant",
  ],
  "VitaLife": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Icarus Microsystems": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Universal Energy": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Galactic Cybersystems": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "AeroCorp": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Omnia Cybersystems": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Solaris Space Systems": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "DeltaOne": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Global Pharmaceuticals": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Business Intern", "Business Analyst", "Business Manager", "Operations Manager",
    "Software Consultant", "Senior Software Consultant",
    "Security Guard",
  ],
  "Nova Medical": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "Omega Software": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "IT Intern", "IT Analyst", "IT Manager",
    "Software Consultant", "Senior Software Consultant",
  ],

  // Government agencies
  "Central Intelligence Agency": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Field Agent", "Secret Agent", "Special Operative",
  ],
  "National Security Agency": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software", "Head of Engineering",
    "IT Intern", "IT Analyst", "IT Manager", "Systems Administrator",
    "Security Engineer", "Network Engineer", "Network Administrator",
    "Field Agent", "Secret Agent", "Special Operative",
  ],
  "Watchdog Security": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer", "Head of Software",
    "IT Intern", "IT Analyst", "IT Manager",
    "Network Engineer", "Network Administrator",
    "Field Agent", "Secret Agent", "Special Operative",
    "Security Guard", "Security Officer", "Security Supervisor", "Head of Security",
  ],

  // Mid-tier companies
  "LexoCorp": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer",
    "IT Intern", "IT Analyst", "IT Manager",
    "Business Intern", "Business Analyst", "Business Manager",
    "Security Guard",
  ],
  "Rho Construction": [
    "Software Engineering Intern",
    "Business Intern", "Business Analyst", "Business Manager",
  ],
  "Alpha Enterprises": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer", "Lead Software Developer",
    "Business Intern", "Business Analyst", "Business Manager",
    "Software Consultant", "Senior Software Consultant",
  ],
  "SysCore Securities": [
    "IT Intern", "IT Analyst",
    "Network Engineer",
  ],
  "CompuTek": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer",
    "IT Intern", "IT Analyst",
  ],
  "NetLink Technologies": [
    "Software Engineering Intern", "Junior Software Engineer", "Senior Software Engineer",
    "IT Intern", "IT Analyst",
    "Network Engineer", "Network Administrator",
  ],
  "Carmichael Security": [
    "Software Engineering Intern", "Junior Software Engineer",
    "IT Intern",
    "Network Engineer",
    "Security Guard", "Security Officer", "Security Supervisor",
  ],

  // Entry-level jobs
  "FoodNStuff": ["Employee", "Part-time Employee"],
  "Joe's Guns": ["Employee", "Part-time Employee"],
  "Noodle Bar": ["Waiter", "Part-time Waiter"],
};

// Company city map for filtering
export const COMPANY_CITY_MAP: Record<string, string> = {
  // Aevum
  "AeroCorp": "Aevum",
  "Bachman & Associates": "Aevum",
  "Clarke Incorporated": "Aevum",
  "ECorp": "Aevum",
  "Fulcrum Technologies": "Aevum",
  "Galactic Cybersystems": "Aevum",
  "NetLink Technologies": "Aevum",
  "Rho Construction": "Aevum",
  "Watchdog Security": "Aevum",

  // Chongqing
  "KuaiGong International": "Chongqing",
  "Solaris Space Systems": "Chongqing",

  // Sector-12
  "Alpha Enterprises": "Sector-12",
  "Blade Industries": "Sector-12",
  "Carmichael Security": "Sector-12",
  "Central Intelligence Agency": "Sector-12",
  "DeltaOne": "Sector-12",
  "FoodNStuff": "Sector-12",
  "Four Sigma": "Sector-12",
  "Icarus Microsystems": "Sector-12",
  "Joe's Guns": "Sector-12",
  "MegaCorp": "Sector-12",
  "National Security Agency": "Sector-12",
  "Universal Energy": "Sector-12",

  // New Tokyo
  "DefComm": "New Tokyo",
  "Global Pharmaceuticals": "New Tokyo",
  "Noodle Bar": "New Tokyo",
  "VitaLife": "New Tokyo",

  // Ishima
  "Nova Medical": "Ishima",
  "Omega Software": "Ishima",
  "Storm Technologies": "Ishima",
  "0x6C1": "Ishima",

  // Volhaven
  "CompuTek": "Volhaven",
  "Helios Labs": "Volhaven",
  "LexoCorp": "Volhaven",
  "NWO": "Volhaven",
  "OmniTek Incorporated": "Volhaven",
  "Omnia Cybersystems": "Volhaven",
  "SysCore Securities": "Volhaven",
};
