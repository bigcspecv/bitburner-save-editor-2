import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Terminal-styled button component
 * Matches Bitburner's cyberpunk aesthetic
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          // Base styles
          'border font-mono uppercase tracking-wider transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Size variants
          {
            'px-3 py-1 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },

          // Color variants
          {
            'border-terminal-primary bg-black text-terminal-primary hover:bg-terminal-dim hover:text-black':
              variant === 'primary',
            'border-terminal-secondary bg-black text-terminal-secondary hover:bg-terminal-secondary hover:text-black':
              variant === 'secondary',
            'border-red-500 bg-black text-red-500 hover:bg-red-500 hover:text-black':
              variant === 'danger',
          },

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
