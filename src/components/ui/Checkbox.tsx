import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import clsx from 'clsx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

/**
 * Terminal-styled checkbox component with ASCII-style appearance
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, disabled, checked, defaultChecked, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(defaultChecked || checked || false);

    // Sync with controlled checked prop
    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        const newChecked = e.target.checked;
        setIsChecked(newChecked);
        onChange?.(e);
      }
    };

    return (
      <label
        className={clsx(
          'flex items-center gap-2 cursor-pointer group font-mono relative',
          { 'opacity-50 cursor-not-allowed': disabled }
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        {/* Custom checkbox appearance */}
        <div
          className={clsx(
            'w-5 h-5 border-2 border-terminal-primary bg-black',
            'flex items-center justify-center transition-colors',
            'group-hover:border-terminal-secondary',
            { 'cursor-not-allowed': disabled }
          )}
        >
          {/* Checkmark - shown when checked */}
          {isChecked && (
            <span className="text-terminal-primary text-lg font-bold leading-none">
              ×
            </span>
          )}
        </div>
        {label && (
          <span
            className={clsx(
              'text-terminal-primary text-sm select-none',
              'group-hover:text-terminal-secondary transition-colors',
              { 'cursor-not-allowed': disabled }
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
