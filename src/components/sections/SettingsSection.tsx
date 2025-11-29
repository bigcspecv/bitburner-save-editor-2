import { SectionStub } from './SectionStub';

export function SettingsSection() {
  return (
    <SectionStub
      title="Settings"
      summary="Game settings and UI preferences."
      items={[
        'Game settings',
        'Theme customization',
      ]}
    />
  );
}

