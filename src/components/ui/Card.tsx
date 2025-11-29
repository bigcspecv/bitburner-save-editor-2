import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Terminal-styled card/panel component
 * Used for containing related information with optional title and actions
 */
export function Card({
  className,
  title,
  subtitle,
  actions,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-black border border-terminal-primary p-4',
        'shadow-lg shadow-terminal-primary/20',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-terminal-secondary text-lg font-mono uppercase tracking-wide">
                &gt; {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-terminal-dim text-sm font-mono mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
