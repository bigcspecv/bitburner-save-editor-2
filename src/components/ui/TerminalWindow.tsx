import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';

export interface TerminalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Full-screen terminal window overlay with CRT scanlines effect
 * Styled to look like a classic terminal/DOS window
 */
export function TerminalWindow({
  isOpen,
  onClose,
  title = 'TERMINAL',
  children,
}: TerminalWindowProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Terminal Window */}
      <div
        className={clsx(
          'relative w-full max-w-5xl h-[85vh]',
          'bg-black border-2 border-terminal-primary',
          'shadow-2xl shadow-terminal-primary/40',
          'flex flex-col'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scanlines effect - local to this window */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 50%,
              rgba(0, 255, 0, 0.03) 50%
            )`,
            backgroundSize: '100% 4px',
          }}
        />

        {/* Title Bar */}
        <div className="flex-shrink-0 border-b-2 border-terminal-primary bg-terminal-primary/10 px-2 py-1">
          <div className="flex items-center justify-between">
            {/* Window title */}
            <div className="flex items-center gap-2">
              <span className="text-terminal-primary text-xs font-bold tracking-widest">
                [{title}]
              </span>
            </div>

            {/* Window controls */}
            <div className="flex items-center gap-1">
              {/* Minimize (decorative) */}
              <button
                className="w-6 h-5 border border-terminal-dim/50 text-terminal-dim/50
                         flex items-center justify-center text-xs font-bold
                         cursor-not-allowed"
                disabled
                aria-label="Minimize (disabled)"
              >
                _
              </button>
              {/* Maximize (decorative) */}
              <button
                className="w-6 h-5 border border-terminal-dim/50 text-terminal-dim/50
                         flex items-center justify-center text-xs font-bold
                         cursor-not-allowed"
                disabled
                aria-label="Maximize (disabled)"
              >
                □
              </button>
              {/* Close */}
              <button
                onClick={onClose}
                className="w-6 h-5 border border-terminal-primary text-terminal-primary
                         hover:bg-terminal-primary hover:text-black
                         flex items-center justify-center text-xs font-bold
                         transition-colors"
                aria-label="Close window"
              >
                X
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-terminal-primary relative z-0">
          {children}
        </div>

        {/* Status bar */}
        <div className="flex-shrink-0 border-t border-terminal-dim/30 px-3 py-1 text-2xs text-terminal-dim/50">
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
