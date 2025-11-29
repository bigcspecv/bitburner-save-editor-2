import { useMemo } from "react";
import { AugmentationWithStatus, checkPrerequisites, formatMultiplier, getEffectLabel } from "../../lib/augmentation-utils";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

interface AugmentationCardProps {
  augmentation: AugmentationWithStatus;
  installedAugs: Array<{ name: string; level: number }>;
  queuedAugs: Array<{ name: string; level: number }>;
  onStatusChange: (key: string, newStatus: "none" | "queued" | "installed") => void;
  onReset?: (key: string) => void;
  hasChanges?: boolean;
}

export function AugmentationCard({
  augmentation,
  installedAugs,
  queuedAugs,
  onStatusChange,
  onReset,
  hasChanges,
}: AugmentationCardProps) {
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

  const canInstallOrQueue = prereqCheck.allMet;
  const statusOptions = [
    { value: "none", label: "None" },
    { value: "queued", label: "Queued", disabled: !canInstallOrQueue },
    { value: "installed", label: "Installed", disabled: !canInstallOrQueue },
  ];

  return (
    <div
      className={`border p-4 ${
        hasChanges
          ? "border-terminal-secondary bg-terminal-secondary/5"
          : "border-terminal-primary"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-terminal-secondary font-mono font-bold mb-1">
            {augmentation.name}
            {augmentation.isSpecial && (
              <span className="ml-2 text-xs text-terminal-dim">[SPECIAL]</span>
            )}
          </h3>
          {!prereqCheck.allMet && (
            <div className="text-red-500 text-xs font-mono">
              ⚠ Missing prerequisites
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={augmentation.status}
            onChange={(value) => onStatusChange(augmentation.key, value as "none" | "queued" | "installed")}
            options={statusOptions}
            className="w-32"
          />
          {hasChanges && onReset && (
            <Button onClick={() => onReset(augmentation.key)} variant="secondary" size="sm">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-terminal-primary/80 text-sm mb-3 font-mono leading-relaxed">
        {augmentation.info}
      </p>

      {augmentation.stats && (
        <div className="text-terminal-secondary text-xs mb-3 font-mono border-l-2 border-terminal-secondary pl-2">
          {augmentation.stats}
        </div>
      )}

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm font-mono">
        <div>
          <span className="text-terminal-dim">Rep Cost:</span>{" "}
          <span className="text-terminal-primary">
            {augmentation.repCost === Infinity ? "∞" : augmentation.repCost.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-terminal-dim">Money Cost:</span>{" "}
          <span className="text-terminal-primary">
            {augmentation.moneyCost === Infinity
              ? "∞"
              : `$${augmentation.moneyCost.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Factions */}
      {augmentation.factions.length > 0 && (
        <div className="mb-3">
          <div className="text-terminal-dim text-xs mb-1 font-mono">Available From:</div>
          <div className="flex flex-wrap gap-1">
            {augmentation.factions.map((faction) => (
              <span
                key={faction}
                className="text-xs px-2 py-0.5 border border-terminal-primary/30 text-terminal-primary font-mono"
              >
                {faction}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {prereqCheck.prereqs.length > 0 && (
        <div className="mb-3">
          <div className="text-terminal-dim text-xs mb-1 font-mono">Prerequisites:</div>
          <div className="space-y-1">
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

      {/* Effects */}
      {effects.length > 0 && (
        <div>
          <div className="text-terminal-dim text-xs mb-1 font-mono">Effects:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {effects.map((effect) => (
              <div key={effect.key} className="text-xs font-mono flex justify-between">
                <span className="text-terminal-primary/70">{effect.label}:</span>
                <span className="text-terminal-secondary font-bold">{effect.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
