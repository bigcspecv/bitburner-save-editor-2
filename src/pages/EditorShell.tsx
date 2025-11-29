import { ChangeEvent, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, FileInput } from '../components/ui';

interface EditorShellProps {
  onShowDemo: () => void;
}

/**
 * Main editor landing screen. Save editor sections will plug into this
 * once state management and real data loading are wired up.
 */
export function EditorShell({ onShowDemo }: EditorShellProps) {
  const [saveLoaded, setSaveLoaded] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // TODO: Wire this up to real save loading logic
    console.log('File selected:', selectedFile);
    setSaveLoaded(true);
  };

  return (
    <AppLayout
      subtitle="[UNAUTHORIZED ACCESS GRANTED]"
      action={
        <Button
          size="sm"
          variant="secondary"
          onClick={onShowDemo}
          className="hidden-demo-btn"
        >
          View Component Demo
        </Button>
      }
    >
      {!saveLoaded ? (
        <Card title="Upload Save File" className="max-w-2xl mx-auto">
          <p className="mb-4 text-terminal-dim">
            Select your Bitburner save file (.json or .json.gz)
          </p>
          <FileInput
            accept=".json,.gz"
            buttonText="Select Save File"
            onChange={handleFileChange}
          />
        </Card>
      ) : (
        <Card title="Save Loaded">
          <p className="text-terminal-dim">Editor sections will go here...</p>
        </Card>
      )}
    </AppLayout>
  );
}
