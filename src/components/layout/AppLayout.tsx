import { ReactNode } from 'react';

interface AppLayoutProps {
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Shared page chrome for all screens (header/footer/background).
 * Keeps App.tsx lean and makes it easy to reuse the same framing between
 * the editor and the component demo.
 */
export function AppLayout({ subtitle, action, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-terminal-primary font-mono crt-scanlines">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-glow">
                &gt; BITBURNER SAVE EDITOR v2.0
              </h1>
              {subtitle && <p className="text-terminal-dim mt-1">{subtitle}</p>}
            </div>
            {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
          </div>
        </header>

        {children}

        <footer className="mt-8 text-center text-terminal-dim text-sm">
          <p>&gt; Bitburner v2.8.1 Compatible</p>
          <p>&gt; Unauthorized modification of save files detected</p>
        </footer>
      </div>
    </div>
  );
}
