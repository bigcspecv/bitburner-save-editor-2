import { Card, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function SettingsSection() {
  const settingsSave = useSaveStore((state) => state.currentSave?.SettingsSave);

  const hasSettings = settingsSave !== undefined && settingsSave !== null;

  const tabs = [
    {
      id: 'general',
      label: 'General',
      content: (
        <Card title="General Settings" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">Edit game behavior and display preferences.</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Autosave interval</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Locale and number formatting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Suppress dialogs (augmentations, travel, factions, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Display options (ASCII art, text effects, hotkeys)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Terminal and log capacity limits</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'editor',
      label: 'Script Editor',
      content: (
        <Card title="Script Editor Settings" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">Customize the Monaco script editor.</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Editor theme (Monokai, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Font family and size</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Tab size and indentation style</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Vim mode, word wrap, cursor style</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Key bindings</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'theme',
      label: 'Theme',
      content: (
        <Card title="Theme Settings" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {hasSettings
              ? 'Theme data exists but color editors require additional implementation.'
              : 'No settings data in save file.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Theme includes color definitions and UI styles. Color picker implementation needed.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Primary, secondary, and accent colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Background and surface colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Success, warning, error, and info colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>HP, money, hack, combat, and charisma colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Editor theme colors</span>
            </li>
          </ul>
        </Card>
      ),
    },
  ];

  return (
    <Card
      title="Settings"
      subtitle={hasSettings ? 'Settings loaded' : 'No settings data'}
    >
      <div className="space-y-6">
        {/* Settings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* General */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; General
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasSettings ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasSettings ? 'Configurable' : 'No Data'}
                </span>
              </div>
            </div>
          </div>

          {/* Script Editor */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Script Editor
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasSettings ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasSettings ? 'Configurable' : 'No Data'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; Theme
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasSettings ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasSettings ? 'Configurable' : 'No Data'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="general" />
      </div>
    </Card>
  );
}
