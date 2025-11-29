import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

/**
 * Terminal-styled label component
 * Used for form field labels with optional required indicator
 */
export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={clsx(
        'block text-terminal-secondary text-sm font-mono uppercase tracking-wide',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
