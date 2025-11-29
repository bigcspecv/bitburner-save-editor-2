import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Terminal-styled input component
 * Supports labels and error states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-terminal-secondary text-sm mb-1 font-mono uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full bg-black border text-terminal-primary px-3 py-2',
            'focus:outline-none focus:ring-1 font-mono',
            'placeholder-terminal-dim',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            {
              'border-terminal-primary focus:border-terminal-secondary focus:ring-terminal-secondary':
                !error,
              'border-red-500 focus:border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1 font-mono">&gt; ERROR: {error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
