import { useEffect, useMemo, useState } from 'react';
import { ComponentDemo } from './pages/ComponentDemo';
import { EditorShell } from './pages/EditorShell';

type AppMode = 'editor' | 'demo';

/**
 * Top-level app shell. Keeps routing between the main editor shell and the
 * UI component demo based on query params or user actions.
 */
function App() {
  const initialMode = useMemo<AppMode>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('demo') || params.has('ui-demo') ? 'demo' : 'editor';
  }, []);

  const [mode, setMode] = useState<AppMode>(initialMode);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (mode === 'demo') {
      params.set('demo', 'true');
    } else {
      params.delete('demo');
      params.delete('ui-demo');
    }

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [mode]);

  if (mode === 'demo') {
    return <ComponentDemo onExit={() => setMode('editor')} />;
  }

  return <EditorShell onShowDemo={() => setMode('demo')} />;
}

export default App;
