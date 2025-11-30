import { useMemo, useState } from "react";
import { AugmentationWithStatus, checkPrerequisites, formatMultiplier, getEffectLabel } from "../../lib/augmentation-utils";
import { Button, Select, Checkbox } from "../ui";

interface AugmentationCardProps {
  augmentation: AugmentationWithStatus;
  installedAugs: Array<{ name: string; level: number }>;
  queuedAugs: Array<{ name: string; level: number }>;
  onStatusChange: (key: string, newStatus: "none" | "queued" | "installed") => void;
  onReset?: (key: string) => void;
  hasChanges?: boolean;
  selected?: boolean;
  onToggleSelect?: (key: string) => void;
}

export function AugmentationCard({
  augmentation,
  installedAugs,
  queuedAugs,
  onStatusChange,
  onReset,
  hasChanges,
  selected = false,
  onToggleSelect,
}: AugmentationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const prereqCheck = useMemo(
    () => checkPrerequisites(augmentation.key, installedAugs, queuedAugs),
    [augmentation.key, installedAugs, queuedAugs]
  );

  const effects = useMemo(() => {
    return Object.entries(augmentation.multipliers)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => ({
        key,
        label: getEffectLabel(key as keyof typeof augmentation.multipliers),
        value: formatMultiplier(value!, key),
      }));
  }, [augmentation.multipliers]);

  const canQueue = prereqCheck.allOwned;
  const canInstall = prereqCheck.allInstalled;
  const hasPrereqs = prereqCheck.prereqs.length > 0;
  const statusOptions = [
    { value: "none", label: "None" },
    { value: "queued", label: "Queued", disabled: hasPrereqs && !canQueue },
    { value: "installed", label: "Installed", disabled: hasPrereqs && !canInstall },
  ];

  return (
    <div
      className={`border p-3 relative flex flex-col ${
        isExpanded ? "" : "h-[180px]"
      } ${
        hasChanges
          ? "border-terminal-secondary bg-terminal-secondary/5"
          : "border-terminal-primary"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {onToggleSelect && (
          <div className="flex-shrink-0">
            <Checkbox
              checked={selected}
              onChange={() => onToggleSelect(augmentation.key)}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-terminal-secondary font-mono font-bold text-sm mb-1 truncate" title={augmentation.name}>
            {augmentation.name}
            {augmentation.isSpecial && (
              <span className="ml-2 text-xs text-terminal-dim">[SPECIAL]</span>
            )}
          </h3>
          {hasPrereqs && (
            <>
              {!prereqCheck.allOwned && (
                <div className="text-red-500 text-xs font-mono">
                  ✕ Missing prerequisites
                </div>
              )}
              {prereqCheck.allOwned && !prereqCheck.allInstalled && (
                <div className="text-yellow-500 text-xs font-mono">
                  ⚠ Prereqs only queued
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Select
            value={augmentation.status}
            onChange={(value) => onStatusChange(augmentation.key, value as "none" | "queued" | "installed")}
            options={statusOptions}
            className="w-24 text-xs"
          />
          {hasChanges && onReset && (
            <Button onClick={() => onReset(augmentation.key)} variant="secondary" size="sm">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Content container with overflow */}
      <div className={`flex-1 ${isExpanded ? "" : "overflow-hidden"}`}>
        {/* Effects - moved to top */}
        {effects.length > 0 && (
          <div className="mb-3">
            <div className="text-terminal-dim text-xs mb-1 font-mono">Effects:</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {effects.map((effect) => (
                <div key={effect.key} className="text-xs font-mono flex justify-between">
                  <span className="text-terminal-primary/70">{effect.label}:</span>
                  <span className="text-terminal-secondary font-bold">{effect.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {augmentation.stats && (
          <div className="text-terminal-secondary text-xs mb-2 font-mono border-l-2 border-terminal-secondary pl-2">
            {augmentation.stats}
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mb-2 text-xs font-mono">
          <div>
            <span className="text-terminal-dim">Rep:</span>{" "}
            <span className="text-terminal-primary">
              {augmentation.repCost === Infinity ? "∞" : augmentation.repCost.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-terminal-dim">Cost:</span>{" "}
            <span className="text-terminal-primary">
              {augmentation.moneyCost === Infinity
                ? "∞"
                : `$${augmentation.moneyCost.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Factions */}
        {augmentation.factions.length > 0 && (
          <div className="mb-2">
            <div className="text-terminal-dim text-xs mb-1 font-mono">Available From:</div>
            <div className="flex flex-wrap gap-1">
              {augmentation.factions.map((faction) => (
                <span
                  key={faction}
                  className="text-xs px-1.5 py-0.5 border border-terminal-primary/30 text-terminal-primary font-mono"
                >
                  {faction}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {prereqCheck.prereqs.length > 0 && (
          <div className="mb-2">
            <div className="text-terminal-dim text-xs mb-1 font-mono">Prerequisites:</div>
            <div className="space-y-0.5">
              {prereqCheck.prereqs.map((prereq) => (
                <div key={prereq.key} className="text-xs font-mono flex items-center gap-2">
                  <span className={prereq.installed || prereq.queued ? "text-green-500" : "text-red-500"}>
                    {prereq.installed ? "✓" : prereq.queued ? "Q" : "✗"}
                  </span>
                  <span className="text-terminal-primary">{prereq.name}</span>
                  {prereq.queued && !prereq.installed && (
                    <span className="text-terminal-dim text-xs">(queued)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description - moved to bottom */}
        <div className="mb-2">
          <div className="text-terminal-dim text-xs mb-1 font-mono">Description:</div>
          <p className="text-terminal-primary/80 text-xs font-mono leading-relaxed">
            {augmentation.info}
          </p>
        </div>
      </div>

      {/* Expand/Collapse button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-2 text-center text-terminal-secondary hover:text-terminal-primary text-xs font-mono transition-colors"
        >
          more...
        </button>
      )}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-2 text-center text-terminal-secondary hover:text-terminal-primary text-xs font-mono transition-colors"
        >
          less...
        </button>
      )}
    </div>
  );
}
