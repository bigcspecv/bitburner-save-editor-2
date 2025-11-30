import { Tooltip } from './Tooltip';

/**
 * Security Work Icon - White shield with black star
 */
export function SecurityWorkIcon() {
  return (
    <Tooltip content="This faction offers Security work">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="inline-block"
        aria-label="Security work"
      >
        {/* Shield background */}
        <path
          d="M10 2 L16 5 L16 10 Q16 15 10 18 Q4 15 4 10 L4 5 Z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
        />
        {/* Star */}
        <path
          d="M10 7 L10.8 9.2 L13 9.2 L11.1 10.6 L11.9 12.8 L10 11.4 L8.1 12.8 L8.9 10.6 L7 9.2 L9.2 9.2 Z"
          fill="black"
        />
      </svg>
    </Tooltip>
  );
}

/**
 * Hacking Work Icon - Green command prompt ">|"
 */
export function HackingWorkIcon() {
  return (
    <Tooltip content="This faction offers Hacking work">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="inline-block"
        aria-label="Hacking work"
      >
        {/* Greater than symbol */}
        <path
          d="M6 6 L12 10 L6 14"
          fill="none"
          stroke="#00ff00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Vertical line */}
        <line
          x1="14"
          y1="6"
          x2="14"
          y2="14"
          stroke="#00ff00"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Tooltip>
  );
}

/**
 * Field Work Icon - Blue circle with black compass needles at 45-degree angle
 */
export function FieldWorkIcon() {
  return (
    <Tooltip content="This faction offers Field work">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="inline-block"
        aria-label="Field work"
      >
        {/* Blue circle background */}
        <circle cx="10" cy="10" r="8" fill="#4444ff" stroke="#4444ff" strokeWidth="0.5" />
        {/* Compass needle pointing NE (45 degrees) */}
        <line
          x1="10"
          y1="10"
          x2="14"
          y2="6"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Compass needle pointing SW (45 degrees) */}
        <line
          x1="10"
          y1="10"
          x2="6"
          y2="14"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Compass needle pointing NW (-45 degrees) */}
        <line
          x1="10"
          y1="10"
          x2="6"
          y2="6"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Compass needle pointing SE (-45 degrees) */}
        <line
          x1="10"
          y1="10"
          x2="14"
          y2="14"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Tooltip>
  );
}

/**
 * Enemy Faction Warning Icon - Red octagon with black exclamation point
 */
export interface EnemyFactionIconProps {
  /** Array of enemy faction names */
  enemies: string[];
}

export function EnemyFactionIcon({ enemies }: EnemyFactionIconProps) {
  if (!enemies || enemies.length === 0) {
    return null;
  }

  const tooltipContent = (
    <div className="text-left">
      <div className="font-bold mb-1">This faction is enemies with:</div>
      <ul className="list-disc list-inside space-y-0.5">
        {enemies.map((enemy) => (
          <li key={enemy}>{enemy}</li>
        ))}
      </ul>
      <div className="mt-2 text-terminal-dim">
        Joining this faction will prevent you from joining its enemies.
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="inline-block"
        aria-label="Has enemy factions"
      >
        {/* Red octagon background */}
        <path
          d="M6 2 L14 2 L18 6 L18 14 L14 18 L6 18 L2 14 L2 6 Z"
          fill="#ff0000"
          stroke="#ff0000"
          strokeWidth="0.5"
        />
        {/* Black exclamation point */}
        <line
          x1="10"
          y1="6"
          x2="10"
          y2="12"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="10" cy="15" r="1" fill="black" />
      </svg>
    </Tooltip>
  );
}

/**
 * Container for displaying multiple faction icons in a row
 */
export interface FactionIconsProps {
  /** Faction name to look up metadata */
  factionName: string;
  /** Faction metadata */
  metadata: {
    enemies?: string[];
    offerHackingWork?: boolean;
    offerFieldWork?: boolean;
    offerSecurityWork?: boolean;
  };
}

export function FactionIcons({ metadata }: FactionIconsProps) {
  const hasAnyIcon =
    metadata.enemies?.length ||
    metadata.offerHackingWork ||
    metadata.offerFieldWork ||
    metadata.offerSecurityWork;

  if (!hasAnyIcon) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {metadata.enemies && metadata.enemies.length > 0 && (
        <EnemyFactionIcon enemies={metadata.enemies} />
      )}
      {metadata.offerHackingWork && <HackingWorkIcon />}
      {metadata.offerSecurityWork && <SecurityWorkIcon />}
      {metadata.offerFieldWork && <FieldWorkIcon />}
    </div>
  );
}
