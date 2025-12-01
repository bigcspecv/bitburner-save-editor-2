import { Card } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function ScriptsSection() {
  const allServers = useSaveStore((state) => state.currentSave?.AllServersSave);

  if (!allServers) {
    return (
      <Card title="Scripts" subtitle="Load a save file to view scripts">
        <p className="text-terminal-dim text-sm">
          No save file loaded. Upload a save file to view and edit your scripts.
        </p>
      </Card>
    );
  }

  // Count scripts across all servers
  let totalScripts = 0;
  let serversWithScripts = 0;
  const serverScriptCounts: { hostname: string; count: number }[] = [];

  for (const [hostname, server] of Object.entries(allServers)) {
    const scripts = server.data.scripts;
    const scriptCount = scripts instanceof Map ? scripts.size : Object.keys(scripts || {}).length;
    if (scriptCount > 0) {
      totalScripts += scriptCount;
      serversWithScripts++;
      serverScriptCounts.push({ hostname, count: scriptCount });
    }
  }

  // Sort by script count descending
  serverScriptCounts.sort((a, b) => b.count - a.count);

  return (
    <Card
      title="Scripts"
      subtitle={`${totalScripts} script${totalScripts !== 1 ? 's' : ''} across ${serversWithScripts} server${serversWithScripts !== 1 ? 's' : ''}`}
    >
      <div className="space-y-6">
        {/* Scripts Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Scripts */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Total Scripts
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Count:</span>
                <span className="text-terminal-primary">{totalScripts}</span>
              </div>
            </div>
          </div>

          {/* Servers with Scripts */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Servers
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">With Scripts:</span>
                <span className="text-terminal-primary">{serversWithScripts}</span>
              </div>
            </div>
          </div>

          {/* Top Server */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Most Scripts
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Server:</span>
                <span className="text-terminal-primary">
                  {serverScriptCounts[0]?.hostname ?? 'N/A'}
                </span>
              </div>
              {serverScriptCounts[0] && (
                <div className="flex justify-between">
                  <span className="text-terminal-dim">Count:</span>
                  <span className="text-terminal-primary">{serverScriptCounts[0].count}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Script Editor Stub */}
        <Card title="Script Editor" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">
            View and edit scripts stored across all servers in your save file.
          </p>
          <p className="mt-2 text-black text-sm italic">
            Future implementation: VS Code-style file browser on left, text editor on right.
            Scripts stored in AllServersSave[hostname].scripts with filename, code, and server properties.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>File tree browser (servers → scripts)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Full-screen text editor for script code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Create, rename, and delete scripts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Copy scripts between servers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Search across all scripts</span>
            </li>
          </ul>

          {/* Preview of servers with scripts */}
          {serverScriptCounts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-terminal-dim">
              <h4 className="text-terminal-secondary text-sm mb-2">&gt; Servers with scripts:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm font-mono">
                {serverScriptCounts.slice(0, 12).map(({ hostname, count }) => (
                  <div key={hostname} className="flex justify-between text-terminal-dim">
                    <span className="truncate mr-2">{hostname}</span>
                    <span className="text-terminal-primary">{count}</span>
                  </div>
                ))}
                {serverScriptCounts.length > 12 && (
                  <div className="text-terminal-dim">
                    +{serverScriptCounts.length - 12} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Card>
  );
}
