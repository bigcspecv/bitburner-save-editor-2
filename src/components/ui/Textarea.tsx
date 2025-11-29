import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Terminal-styled textarea component
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-terminal-secondary text-sm mb-1 font-mono uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full bg-black border text-terminal-primary px-3 py-2',
            'focus:outline-none focus:ring-1 font-mono',
            'placeholder-terminal-dim resize-y',
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

Textarea.displayName = 'Textarea';
