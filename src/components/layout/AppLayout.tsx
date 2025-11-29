import { ReactNode } from 'react';

interface AppLayoutProps {
  subtitle?: string;
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
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-glow mb-2">
            &gt; BITBURNER SAVE EDITOR v2.0
          </h1>
          {subtitle && <p className="text-terminal-dim">{subtitle}</p>}
          {action ? <div className="mt-4">{action}</div> : null}
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
