import { ChangeEvent } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { GameSectionTabs } from '../components/sections';
import { Button, Card, FileInput } from '../components/ui';
import { downloadSaveFile } from '../lib/save-exporter';
import { useSaveStore } from '../store/save-store';

interface EditorShellProps {
  onShowDemo: () => void;
}

/**
 * Main editor landing screen. Save editor sections will plug into this
 * once state management and real data loading are wired up.
 */
export function EditorShell({ onShowDemo }: EditorShellProps) {
  const status = useSaveStore((state) => state.status);
  const error = useSaveStore((state) => state.error);
  const lastFileName = useSaveStore((state) => state.lastFileName);
  const saveFormat = useSaveStore((state) => state.saveFormat);
  const currentSave = useSaveStore((state) => state.currentSave);
  const originalSave = useSaveStore((state) => state.originalSave);
  const originalRawData = useSaveStore((state) => state.originalRawData);
  const loadFromFile = useSaveStore((state) => state.loadFromFile);
  const resetToOriginal = useSaveStore((state) => state.resetToOriginal);
  const hasChanges = useSaveStore((state) => state.hasChanges());
  const isLoaded = useSaveStore((state) => Boolean(state.currentSave && state.originalSave));
  const isLoading = status === 'loading';

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    await loadFromFile(selectedFile);
  };

  const handleDownload = () => {
    if (!currentSave) return;

    const exportFormat = saveFormat === 'gzipped' ? 'json-gz' : saveFormat === 'base64' ? 'base64' : 'json';
    const baseName = lastFileName?.replace(/(\.json(\.gz)?)$/i, '') ?? 'bitburnerSave';
    const extension = exportFormat === 'json-gz' ? '.json.gz' : '.json';
    const fileName = `${baseName}_HaCk3D${extension}`;

    downloadSaveFile(currentSave, fileName, exportFormat, {
      originalParsed: originalSave,
      originalRawData,
    });
  };

  const headerActions = isLoaded && hasChanges ? (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={resetToOriginal}
        disabled={isLoading}
      >
        Revert to Original
      </Button>
      <Button
        size="sm"
        onClick={handleDownload}
        disabled={!currentSave || isLoading}
      >
        Download Modified Save
      </Button>
    </>
  ) : null;

  const subtitleContent = isLoaded ? (
    <span className="inline-flex items-center gap-3 flex-wrap">
      <span className="whitespace-nowrap"><span className="text-terminal-primary">Editing:</span> {lastFileName ?? 'save file'}</span>
      <FileInput
        accept=".json,.gz"
        buttonText="Load Different File"
        onChange={handleFileChange}
        showFilename={false}
        disabled={isLoading}
        size="sm"
      />
    </span>
  ) : '[UNAUTHORIZED ACCESS GRANTED]';

  return (
    <AppLayout
      subtitle={subtitleContent}
      action={headerActions}
    >
      {!isLoaded ? (
        <Card title="Upload Save File" className="max-w-2xl mx-auto">
          <p className="mb-4 text-terminal-dim">
            Select your Bitburner save file (.json or .json.gz)
          </p>
          <FileInput
            accept=".json,.gz"
            buttonText="Select Save File"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {isLoading && (
            <p className="text-terminal-secondary mt-3 text-sm">&gt; Loading save data...</p>
          )}
          {status === 'error' && error && (
            <p className="text-red-500 mt-3 text-sm font-mono">&gt; {error}</p>
          )}
        </Card>
      ) : (
        <>
          {status === 'error' && error && (
            <p className="text-red-500 mb-4 text-sm font-mono">&gt; {error}</p>
          )}
          <GameSectionTabs />
        </>
      )}
    </AppLayout>
  );
}
