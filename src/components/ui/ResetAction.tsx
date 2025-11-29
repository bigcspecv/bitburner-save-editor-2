import type { ButtonProps } from './Button';
import { Button } from './Button';

export interface ResetActionProps {
  title: string;
  hasChanges: boolean;
  onReset: () => void;
  disabled?: boolean;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  noChangesLabel?: string;
  className?: string;
}

/**
 * Reusable reset control that shows a reset button when changes exist,
 * otherwise renders a dim "No Modifications" label.
 */
export function ResetAction({
  title,
  hasChanges,
  onReset,
  disabled,
  variant = 'secondary',
  size = 'sm',
  noChangesLabel = 'No Modifications',
  className = '',
}: ResetActionProps) {
  if (hasChanges) {
    return (
      <Button
        size={size}
        variant={variant}
        onClick={onReset}
        disabled={disabled}
        className={className}
      >
        {title}
      </Button>
    );
  }

  return (
    <span className={`text-terminal-dim text-xs uppercase ${className}`}>
      {noChangesLabel}
    </span>
  );
}
