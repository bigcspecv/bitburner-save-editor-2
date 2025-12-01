import { useState } from 'react';
import { Card, Tabs, Checkbox, NumberInput, Input, ResetAction, Select, ColorInput } from '../ui';
import type { SelectOption } from '../ui/Select';
import { useSaveStore } from '../../store/save-store';
import type { SettingsSave } from '../../models/schemas/misc';

// Theme interface matching Bitburner's ITheme
interface ITheme {
  primarylight: string;
  primary: string;
  primarydark: string;
  successlight: string;
  success: string;
  successdark: string;
  errorlight: string;
  error: string;
  errordark: string;
  secondarylight: string;
  secondary: string;
  secondarydark: string;
  warninglight: string;
  warning: string;
  warningdark: string;
  infolight: string;
  info: string;
  infodark: string;
  welllight: string;
  well: string;
  white: string;
  black: string;
  hp: string;
  money: string;
  hack: string;
  combat: string;
  cha: string;
  int: string;
  rep: string;
  disabled: string;
  backgroundprimary: string;
  backgroundsecondary: string;
  button: string;
  maplocation: string;
  bnlvl0: string;
  bnlvl1: string;
  bnlvl2: string;
  bnlvl3: string;
}

// Default theme from Bitburner source
const DEFAULT_THEME: ITheme = {
  primarylight: '#0f0',
  primary: '#0c0',
  primarydark: '#090',
  successlight: '#0f0',
  success: '#0c0',
  successdark: '#090',
  errorlight: '#f00',
  error: '#c00',
  errordark: '#900',
  secondarylight: '#AAA',
  secondary: '#888',
  secondarydark: '#666',
  warninglight: '#ff0',
  warning: '#cc0',
  warningdark: '#990',
  infolight: '#69f',
  info: '#36c',
  infodark: '#039',
  welllight: '#444',
  well: '#222',
  white: '#fff',
  black: '#000',
  hp: '#dd3434',
  money: '#ffd700',
  hack: '#adff2f',
  combat: '#faffdf',
  cha: '#a671d1',
  int: '#6495ed',
  rep: '#faffdf',
  disabled: '#66cfbc',
  backgroundprimary: '#000',
  backgroundsecondary: '#000',
  button: '#333',
  maplocation: '#ffffff',
  bnlvl0: '#ffff00',
  bnlvl1: '#ff0000',
  bnlvl2: '#48d1cc',
  bnlvl3: '#0000ff',
};

// Predefined theme presets from Bitburner source
const PREDEFINED_THEMES: Record<string, { name: string; colors: ITheme }> = {
  default: {
    name: 'Default',
    colors: DEFAULT_THEME,
  },
  dracula: {
    name: 'Dracula',
    colors: {
      primarylight: '#7082B8',
      primary: '#F8F8F2',
      primarydark: '#FF79C6',
      successlight: '#0f0',
      success: '#0c0',
      successdark: '#090',
      errorlight: '#FD4545',
      error: '#FF2D2D',
      errordark: '#C62424',
      secondarylight: '#AAA',
      secondary: '#8BE9FD',
      secondarydark: '#666',
      warninglight: '#FFC281',
      warning: '#FFB86C',
      warningdark: '#E6A055',
      infolight: '#A0A0FF',
      info: '#7070FF',
      infodark: '#4040FF',
      welllight: '#44475A',
      well: '#363948',
      white: '#fff',
      black: '#282A36',
      hp: '#D34448',
      money: '#50FA7B',
      hack: '#F1FA8C',
      combat: '#BD93F9',
      cha: '#FF79C6',
      int: '#6495ed',
      rep: '#faffdf',
      disabled: '#66cfbc',
      backgroundprimary: '#282A36',
      backgroundsecondary: '#21222C',
      button: '#21222C',
      maplocation: '#ffffff',
      bnlvl0: '#ffff00',
      bnlvl1: '#ff0000',
      bnlvl2: '#48d1cc',
      bnlvl3: '#0000ff',
    },
  },
  monokai: {
    name: "Monokai'ish",
    colors: {
      primarylight: '#FFF',
      primary: '#F8F8F2',
      primarydark: '#FAFAEB',
      successlight: '#ADE146',
      success: '#A6E22E',
      successdark: '#98E104',
      errorlight: '#FF69A0',
      error: '#F92672',
      errordark: '#D10F56',
      secondarylight: '#AAA',
      secondary: '#888',
      secondarydark: '#666',
      warninglight: '#E1D992',
      warning: '#E6DB74',
      warningdark: '#EDDD54',
      infolight: '#92E1F1',
      info: '#66D9EF',
      infodark: '#31CDED',
      welllight: '#444',
      well: '#222',
      white: '#fff',
      black: '#000',
      hp: '#F92672',
      money: '#E6DB74',
      hack: '#A6E22E',
      combat: '#75715E',
      cha: '#AE81FF',
      int: '#66D9EF',
      rep: '#E69F66',
      disabled: '#66cfbc',
      backgroundprimary: '#272822',
      backgroundsecondary: '#1B1C18',
      button: '#333',
      maplocation: '#ffffff',
      bnlvl0: '#ffff00',
      bnlvl1: '#ff0000',
      bnlvl2: '#48d1cc',
      bnlvl3: '#0000ff',
    },
  },
};

const THEME_PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Select Preset' },
  { value: 'default', label: 'Default' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'monokai', label: "Monokai'ish" },
];

// Type guard for SettingsSave
function isSettingsSave(value: unknown): value is SettingsSave {
  return value !== null && typeof value === 'object';
}

// Monaco editor theme options (from Bitburner's loadThemes)
const MONACO_THEME_OPTIONS: SelectOption[] = [
  { value: 'monokai', label: 'Monokai' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'solarized-light', label: 'Solarized Light' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'one-dark', label: 'One Dark' },
];

// Word wrap options (from Monaco editor)
const WORD_WRAP_OPTIONS: SelectOption[] = [
  { value: 'off', label: 'Off' },
  { value: 'on', label: 'On' },
  { value: 'bounded', label: 'Bounded' },
  { value: 'wordWrapColumn', label: 'Word Wrap Column' },
];

// Cursor style options (from Monaco editor)
const CURSOR_STYLE_OPTIONS: SelectOption[] = [
  { value: 'line', label: 'Line' },
  { value: 'block', label: 'Block' },
  { value: 'underline', label: 'Underline' },
  { value: 'line-thin', label: 'Line (Thin)' },
  { value: 'block-outline', label: 'Block (Outline)' },
  { value: 'underline-thin', label: 'Underline (Thin)' },
];

// Cursor blinking options (from Monaco editor)
const CURSOR_BLINKING_OPTIONS: SelectOption[] = [
  { value: 'blink', label: 'Blink' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'phase', label: 'Phase' },
  { value: 'expand', label: 'Expand' },
  { value: 'solid', label: 'Solid' },
];

// Helper to safely get a setting value
function getSetting<T>(settings: SettingsSave | undefined, key: string, defaultValue: T): T {
  if (!settings || !isSettingsSave(settings)) return defaultValue;
  const value = (settings as Record<string, unknown>)[key];
  return value !== undefined ? (value as T) : defaultValue;
}

interface SettingRowProps {
  label: string;
  description?: string;
  warning?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, warning, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-terminal-dim/30 last:border-b-0">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-terminal-primary text-sm">{label}</div>
        {description && (
          <div className="text-terminal-dim text-xs mt-0.5">{description}</div>
        )}
        {warning && (
          <div className="text-yellow-500 text-xs mt-0.5">! {warning}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

interface SettingGroupProps {
  title: string;
  children: React.ReactNode;
}

function SettingGroup({ title, children }: SettingGroupProps) {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-terminal-secondary text-xs uppercase tracking-wide mb-2 border-b border-terminal-dim pb-1">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// Color row component for theme editor
interface ColorRowProps {
  label: string;
  colorKey: keyof ITheme;
  theme: Partial<ITheme>;
  defaultTheme: ITheme;
  onColorChange: (key: keyof ITheme, value: string) => void;
}

function ColorRow({ label, colorKey, theme, defaultTheme, onColorChange }: ColorRowProps) {
  const currentValue = theme[colorKey] ?? defaultTheme[colorKey];
  const isModified = theme[colorKey] !== undefined && theme[colorKey] !== defaultTheme[colorKey];

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-terminal-dim/20 last:border-b-0 gap-2">
      <div className="flex items-center gap-1 min-w-0 flex-shrink overflow-hidden">
        <span className="text-terminal-primary text-sm truncate">{label}</span>
        {isModified && (
          <span className="text-yellow-500 text-xs flex-shrink-0">*</span>
        )}
      </div>
      <ColorInput
        value={currentValue}
        onChange={(value) => onColorChange(colorKey, value)}
      />
    </div>
  );
}

// Color group component
interface ColorGroupProps {
  title: string;
  colors: { key: keyof ITheme; label: string }[];
  theme: Partial<ITheme>;
  defaultTheme: ITheme;
  onColorChange: (key: keyof ITheme, value: string) => void;
}

function ColorGroup({ title, colors, theme, defaultTheme, onColorChange }: ColorGroupProps) {
  return (
    <div className="mb-6 last:mb-0 min-w-0 overflow-hidden">
      <h4 className="text-terminal-secondary text-xs uppercase tracking-wide mb-2 border-b border-terminal-dim pb-1">
        {title}
      </h4>
      <div className="space-y-0">
        {colors.map(({ key, label }) => (
          <ColorRow
            key={key}
            label={label}
            colorKey={key}
            theme={theme}
            defaultTheme={defaultTheme}
            onColorChange={onColorChange}
          />
        ))}
      </div>
    </div>
  );
}

// Theme preview component
interface ThemePreviewProps {
  theme: Partial<ITheme>;
  defaultTheme: ITheme;
}

function ThemePreview({ theme, defaultTheme }: ThemePreviewProps) {
  const getColor = (key: keyof ITheme) => theme[key] ?? defaultTheme[key];

  return (
    <div
      className="border border-terminal-dim rounded p-4 mb-6"
      style={{ backgroundColor: getColor('backgroundprimary') }}
    >
      <div className="text-xs uppercase tracking-wide mb-3 opacity-70" style={{ color: getColor('secondary') }}>
        Theme Preview
      </div>
      <div className="space-y-2">
        {/* Primary colors */}
        <div className="flex items-center gap-2">
          <span style={{ color: getColor('primarylight') }}>Primary Light</span>
          <span style={{ color: getColor('primary') }}>Primary</span>
          <span style={{ color: getColor('primarydark') }}>Primary Dark</span>
        </div>
        {/* Status colors */}
        <div className="flex items-center gap-4">
          <span style={{ color: getColor('success') }}>Success</span>
          <span style={{ color: getColor('warning') }}>Warning</span>
          <span style={{ color: getColor('error') }}>Error</span>
          <span style={{ color: getColor('info') }}>Info</span>
        </div>
        {/* Game stats */}
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: getColor('hp') }}>HP</span>
          <span style={{ color: getColor('money') }}>Money</span>
          <span style={{ color: getColor('hack') }}>Hack</span>
          <span style={{ color: getColor('combat') }}>Combat</span>
          <span style={{ color: getColor('cha') }}>Cha</span>
          <span style={{ color: getColor('int') }}>Int</span>
        </div>
        {/* Button preview */}
        <div className="mt-2">
          <span
            className="px-3 py-1 text-sm rounded"
            style={{
              backgroundColor: getColor('button'),
              color: getColor('primary'),
              border: `1px solid ${getColor('primary')}`
            }}
          >
            Button
          </span>
        </div>
      </div>
    </div>
  );
}

// Theme tab content component
interface ThemeTabContentProps {
  settings: SettingsSave | undefined;
  updateSettings: (updates: Partial<SettingsSave>) => void;
  resetSettings: () => void;
  hasSettingsChanges: () => boolean;
}

function ThemeTabContent({ settings, updateSettings, resetSettings, hasSettingsChanges }: ThemeTabContentProps) {
  // Get current theme from settings, default to empty object
  const currentTheme = (settings?.theme ?? {}) as Partial<ITheme>;

  // Track which preset is currently selected (for reset functionality)
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Get the base theme to compare against (selected preset or default)
  const baseTheme: Partial<ITheme> = selectedPreset && PREDEFINED_THEMES[selectedPreset]
    ? PREDEFINED_THEMES[selectedPreset].colors
    : DEFAULT_THEME;

  const handleColorChange = (key: keyof ITheme, value: string) => {
    const newTheme = { ...currentTheme, [key]: value };
    updateSettings({ theme: newTheme });
  };

  const handlePresetChange = (presetKey: string | number) => {
    if (!presetKey || typeof presetKey !== 'string') return;
    const preset = PREDEFINED_THEMES[presetKey];
    if (preset) {
      setSelectedPreset(presetKey);
      updateSettings({ theme: { ...preset.colors } });
    }
  };

  const handleResetTheme = () => {
    // Reset to the selected preset's colors (or default if none selected)
    if (selectedPreset && PREDEFINED_THEMES[selectedPreset]) {
      updateSettings({ theme: { ...PREDEFINED_THEMES[selectedPreset].colors } });
    } else {
      updateSettings({ theme: { ...DEFAULT_THEME } });
    }
  };

  // Check if theme differs from base theme (selected preset or default)
  const hasThemeChanges = JSON.stringify(currentTheme) !== JSON.stringify(baseTheme);

  // Color groups organized by category
  const colorGroups: { title: string; colors: { key: keyof ITheme; label: string }[] }[] = [
    {
      title: 'Primary Colors',
      colors: [
        { key: 'primarylight', label: 'Primary Light' },
        { key: 'primary', label: 'Primary' },
        { key: 'primarydark', label: 'Primary Dark' },
      ],
    },
    {
      title: 'Success Colors',
      colors: [
        { key: 'successlight', label: 'Success Light' },
        { key: 'success', label: 'Success' },
        { key: 'successdark', label: 'Success Dark' },
      ],
    },
    {
      title: 'Error Colors',
      colors: [
        { key: 'errorlight', label: 'Error Light' },
        { key: 'error', label: 'Error' },
        { key: 'errordark', label: 'Error Dark' },
      ],
    },
    {
      title: 'Secondary Colors',
      colors: [
        { key: 'secondarylight', label: 'Secondary Light' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'secondarydark', label: 'Secondary Dark' },
      ],
    },
    {
      title: 'Warning Colors',
      colors: [
        { key: 'warninglight', label: 'Warning Light' },
        { key: 'warning', label: 'Warning' },
        { key: 'warningdark', label: 'Warning Dark' },
      ],
    },
    {
      title: 'Info Colors',
      colors: [
        { key: 'infolight', label: 'Info Light' },
        { key: 'info', label: 'Info' },
        { key: 'infodark', label: 'Info Dark' },
      ],
    },
    {
      title: 'UI Colors',
      colors: [
        { key: 'welllight', label: 'Well Light' },
        { key: 'well', label: 'Well' },
        { key: 'white', label: 'White' },
        { key: 'black', label: 'Black' },
        { key: 'disabled', label: 'Disabled' },
      ],
    },
    {
      title: 'Background & Buttons',
      colors: [
        { key: 'backgroundprimary', label: 'Background Primary' },
        { key: 'backgroundsecondary', label: 'Background Secondary' },
        { key: 'button', label: 'Button' },
        { key: 'maplocation', label: 'Map Location' },
      ],
    },
    {
      title: 'Game Stats',
      colors: [
        { key: 'hp', label: 'HP' },
        { key: 'money', label: 'Money' },
        { key: 'hack', label: 'Hacking' },
        { key: 'combat', label: 'Combat' },
        { key: 'cha', label: 'Charisma' },
        { key: 'int', label: 'Intelligence' },
        { key: 'rep', label: 'Reputation' },
      ],
    },
    {
      title: 'BitNode Levels',
      colors: [
        { key: 'bnlvl0', label: 'Level 0 (None)' },
        { key: 'bnlvl1', label: 'Level 1' },
        { key: 'bnlvl2', label: 'Level 2' },
        { key: 'bnlvl3', label: 'Level 3+' },
      ],
    },
  ];

  // Get the name of the preset for display
  const presetName = selectedPreset && PREDEFINED_THEMES[selectedPreset]
    ? PREDEFINED_THEMES[selectedPreset].name
    : 'Default';

  return (
    <div className="space-y-6">
      {/* Header with Reset */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-terminal-secondary text-sm uppercase tracking-wide">
          &gt; Theme Colors
          {selectedPreset && (
            <span className="text-terminal-dim ml-2">({presetName})</span>
          )}
        </h3>
        <div className="flex items-center gap-4">
          {hasThemeChanges && (
            <button
              onClick={handleResetTheme}
              className="text-xs text-yellow-500 hover:text-yellow-400 underline"
            >
              Reset to {presetName}
            </button>
          )}
          <ResetAction
            hasChanges={hasSettingsChanges()}
            onReset={resetSettings}
            title="Reset All Settings"
          />
        </div>
      </div>

      {/* Preset Selector */}
      <div className="mb-6">
        <SettingRow
          label="Theme Preset"
          description="Select a predefined color scheme. Modifying colors will show a reset option."
        >
          <Select
            options={THEME_PRESET_OPTIONS}
            value={selectedPreset}
            onChange={handlePresetChange}
            showSearch={false}
            className="w-48"
          />
        </SettingRow>
      </div>

      {/* Theme Preview */}
      <ThemePreview theme={currentTheme} defaultTheme={DEFAULT_THEME} />

      {/* Color Groups in 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 overflow-hidden">
        {colorGroups.map((group) => (
          <ColorGroup
            key={group.title}
            title={group.title}
            colors={group.colors}
            theme={currentTheme}
            defaultTheme={DEFAULT_THEME}
            onColorChange={handleColorChange}
          />
        ))}
      </div>
    </div>
  );
}

export function SettingsSection() {
  const settingsSave = useSaveStore((state) => state.currentSave?.SettingsSave);
  const updateSettings = useSaveStore((state) => state.updateSettings);
  const resetSettings = useSaveStore((state) => state.resetSettings);
  const hasSettingsChanges = useSaveStore((state) => state.hasSettingsChanges);

  const hasSettings = settingsSave !== undefined && settingsSave !== null && isSettingsSave(settingsSave);
  const settings = hasSettings ? settingsSave : undefined;

  const handleBooleanChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ [key]: e.target.checked });
  };

  const handleNumberChange = (key: string) => (value: number) => {
    updateSettings({ [key]: value });
  };

  const handleStringChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ [key]: e.target.value });
  };

  const tabs = [
    {
      id: 'general',
      label: 'General',
      content: hasSettings ? (
        <div className="space-y-6">
          {/* Header with Reset */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide">
              &gt; General Settings
            </h3>
            <ResetAction
              hasChanges={hasSettingsChanges()}
              onReset={resetSettings}
              title="Reset Settings"
            />
          </div>

          {/* Autosave & Locale */}
          <SettingGroup title="System">
            <SettingRow
              label="Autosave Interval (seconds)"
              description="Time between each autosave. Set to 0 to disable autosave. (Default: 60)"
            >
              <NumberInput
                value={getSetting(settings, 'AutosaveInterval', 60)}
                onChange={handleNumberChange('AutosaveInterval')}
                min={0}
                max={600}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Locale"
              description="Locale for number formatting (en, de, fr, es, ru, etc.). (Default: en)"
            >
              <Input
                value={getSetting(settings, 'Locale', 'en')}
                onChange={handleStringChange('Locale')}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Timestamps Format"
              description="Terminal and log timestamp format. Uses date-fns format. Empty = disabled. (Default: empty)"
            >
              <Input
                value={getSetting(settings, 'TimestampsFormat', '')}
                onChange={handleStringChange('TimestampsFormat')}
                placeholder="yyyy-MM-dd hh:mm:ss"
                className="w-40"
              />
            </SettingRow>
          </SettingGroup>

          {/* Display Options */}
          <SettingGroup title="Display Options">
            <SettingRow
              label="Disable ASCII Art"
              description="ASCII art for UI elements will be disabled. Does not affect faction description ASCII art."
            >
              <Checkbox
                checked={getSetting(settings, 'DisableASCIIArt', false)}
                onChange={handleBooleanChange('DisableASCIIArt')}
              />
            </SettingRow>
            <SettingRow
              label="Disable Hotkeys"
              description="Disables most hotkeys including Terminal commands, navigation shortcuts, and editor Save (Ctrl+b)."
            >
              <Checkbox
                checked={getSetting(settings, 'DisableHotkeys', false)}
                onChange={handleBooleanChange('DisableHotkeys')}
              />
            </SettingRow>
            <SettingRow
              label="Disable Text Effects"
              description="Text effects will not be displayed. Can help if text is difficult to read in certain areas."
            >
              <Checkbox
                checked={getSetting(settings, 'DisableTextEffects', false)}
                onChange={handleBooleanChange('DisableTextEffects')}
              />
            </SettingRow>
            <SettingRow
              label="Disable Overview Progress Bars"
              description="Progress bars in the character overview will be hidden."
            >
              <Checkbox
                checked={getSetting(settings, 'DisableOverviewProgressBars', false)}
                onChange={handleBooleanChange('DisableOverviewProgressBars')}
              />
            </SettingRow>
            <SettingRow
              label="Sidebar Opened"
              description="Whether the sidebar is expanded by default. (Default: on)"
            >
              <Checkbox
                checked={getSetting(settings, 'IsSidebarOpened', true)}
                onChange={handleBooleanChange('IsSidebarOpened')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Terminal & Bash */}
          <SettingGroup title="Terminal">
            <SettingRow
              label="Enable Bash Hotkeys"
              description="Improved Bash emulation mode with new Terminal shortcuts that resemble a real Bash shell."
              warning="When enabled, default browser shortcuts are overridden by Bash shortcuts."
            >
              <Checkbox
                checked={getSetting(settings, 'EnableBashHotkeys', false)}
                onChange={handleBooleanChange('EnableBashHotkeys')}
              />
            </SettingRow>
            <SettingRow
              label="Enable History Search"
              description="Up arrow searches history for commands starting with current text. Execute with Enter, autofill with Tab."
            >
              <Checkbox
                checked={getSetting(settings, 'EnableHistorySearch', false)}
                onChange={handleBooleanChange('EnableHistorySearch')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Capacity Limits */}
          <SettingGroup title="Capacity Limits">
            <SettingRow
              label="Terminal Capacity"
              description="Maximum number of entries that can be written to the terminal. (Default: 500)"
              warning="Setting too high can cause the game to use a lot of memory."
            >
              <NumberInput
                value={getSetting(settings, 'MaxTerminalCapacity', 500)}
                onChange={handleNumberChange('MaxTerminalCapacity')}
                min={50}
                max={500}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Netscript Log Size"
              description="Maximum number of lines a script's logs can hold. (Default: 50)"
              warning="Setting too high can cause memory issues if you have many scripts running."
            >
              <NumberInput
                value={getSetting(settings, 'MaxLogCapacity', 50)}
                onChange={handleNumberChange('MaxLogCapacity')}
                min={20}
                max={500}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Netscript Port Size"
              description="Maximum entries that can be written to a port using Netscript's write() function. (Default: 50)"
              warning="Setting too high can cause the game to use a lot of memory."
            >
              <NumberInput
                value={getSetting(settings, 'MaxPortCapacity', 50)}
                onChange={handleNumberChange('MaxPortCapacity')}
                min={20}
                max={100}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Recently Killed Scripts"
              description="Maximum number of recently killed scripts the game will keep. (Default: 50)"
            >
              <NumberInput
                value={getSetting(settings, 'MaxRecentScriptsCapacity', 50)}
                onChange={handleNumberChange('MaxRecentScriptsCapacity')}
                min={0}
                max={500}
                className="w-24"
              />
            </SettingRow>
          </SettingGroup>

          {/* Suppress Dialogs */}
          <SettingGroup title="Suppress Dialogs">
            <SettingRow
              label="Augmentation Confirmation"
              description="Confirmation message before buying augmentations will not appear."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressBuyAugmentationConfirmation', false)}
                onChange={handleBooleanChange('SuppressBuyAugmentationConfirmation')}
              />
            </SettingRow>
            <SettingRow
              label="Travel Confirmation"
              description="Confirmation before traveling will not appear. Travel cost deducted immediately on click."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressTravelConfirmation', false)}
                onChange={handleBooleanChange('SuppressTravelConfirmation')}
              />
            </SettingRow>
            <SettingRow
              label="Faction Invites"
              description="Faction invites won't appear as popups. View pending invites in the Factions page."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressFactionInvites', false)}
                onChange={handleBooleanChange('SuppressFactionInvites')}
              />
            </SettingRow>
            <SettingRow
              label="Story Messages"
              description="Messages won't appear as popups. They'll still be sent as .msg files viewable with 'cat'."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressMessages', false)}
                onChange={handleBooleanChange('SuppressMessages')}
              />
            </SettingRow>
            <SettingRow
              label="Error Modals"
              description="Script errors won't create popups. Errors can still be seen in Active Scripts > Recent Errors."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressErrorModals', false)}
                onChange={handleBooleanChange('SuppressErrorModals')}
              />
            </SettingRow>
            <SettingRow
              label="Bladeburner Popup"
              description="Bladeburner actions interrupted by being busy won't display a popup message."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressBladeburnerPopup', false)}
                onChange={handleBooleanChange('SuppressBladeburnerPopup')}
              />
            </SettingRow>
            <SettingRow
              label="TIX Messages"
              description="Stock market will never create any popup."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressTIXPopup', false)}
                onChange={handleBooleanChange('SuppressTIXPopup')}
              />
            </SettingRow>
            <SettingRow
              label="Auto-Save Toast"
              description="No 'Game Saved!' toast will appear after an auto-save."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressSavedGameToast', false)}
                onChange={handleBooleanChange('SuppressSavedGameToast')}
              />
            </SettingRow>
            <SettingRow
              label="Autosave Disabled Warning"
              description="No warning will be triggered when auto-save is disabled (set to 0)."
            >
              <Checkbox
                checked={getSetting(settings, 'SuppressAutosaveDisabledWarnings', false)}
                onChange={handleBooleanChange('SuppressAutosaveDisabledWarnings')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Number Formatting */}
          <SettingGroup title="Number Formatting">
            <SettingRow
              label="Use GiB instead of GB"
              description="All references to memory will use GiB instead of GB, in accordance with IEC 60027-2."
            >
              <Checkbox
                checked={getSetting(settings, 'UseIEC60027_2', false)}
                onChange={handleBooleanChange('UseIEC60027_2')}
              />
            </SettingRow>
            <SettingRow
              label="Hide Trailing Zeros"
              description="Zeroes at the end of a fractional part of a decimal will not be displayed."
            >
              <Checkbox
                checked={getSetting(settings, 'hideTrailingDecimalZeros', false)}
                onChange={handleBooleanChange('hideTrailingDecimalZeros')}
              />
            </SettingRow>
            <SettingRow
              label="Hide Thousands Separator"
              description="Thousands separators will not be displayed."
            >
              <Checkbox
                checked={getSetting(settings, 'hideThousandsSeparator', false)}
                onChange={handleBooleanChange('hideThousandsSeparator')}
              />
            </SettingRow>
            <SettingRow
              label="Engineering Notation"
              description="Numbers in exponential form will use engineering notation instead of scientific notation."
            >
              <Checkbox
                checked={getSetting(settings, 'useEngineeringNotation', false)}
                onChange={handleBooleanChange('useEngineeringNotation')}
              />
            </SettingRow>
            <SettingRow
              label="Disable Suffixes"
              description="Suffixed form will not be used. Numbers will be displayed with exponential form instead."
            >
              <Checkbox
                checked={getSetting(settings, 'disableSuffixes', false)}
                onChange={handleBooleanChange('disableSuffixes')}
              />
            </SettingRow>
            <SettingRow
              label="Show Null Time Units"
              description="Show all intermediary time units even when zero. Example: '1h 13s' becomes '1h 0m 13s'."
            >
              <Checkbox
                checked={getSetting(settings, 'ShowMiddleNullTimeUnit', false)}
                onChange={handleBooleanChange('ShowMiddleNullTimeUnit')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Save Options */}
          <SettingGroup title="Save Options">
            <SettingRow
              label="Save Game on File Save"
              description="Save your game any time a file is saved in the script editor. (Default: on)"
            >
              <Checkbox
                checked={getSetting(settings, 'SaveGameOnFileSave', true)}
                onChange={handleBooleanChange('SaveGameOnFileSave')}
              />
            </SettingRow>
            <SettingRow
              label="Exclude Running Scripts"
              description="Save file will exclude all running scripts. Only useful if your save is lagging. (Default: off)"
              warning="You'll have to restart scripts every time you launch the game. Consider using autoexec."
            >
              <Checkbox
                checked={getSetting(settings, 'ExcludeRunningScriptsFromSave', false)}
                onChange={handleBooleanChange('ExcludeRunningScriptsFromSave')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Misc */}
          <SettingGroup title="Miscellaneous">
            <SettingRow
              label="Go Traditional Style"
              description="Use traditional wood and stone style for IPvGO instead of cyberpunk style. (Default: off)"
            >
              <Checkbox
                checked={getSetting(settings, 'GoTraditionalStyle', false)}
                onChange={handleBooleanChange('GoTraditionalStyle')}
              />
            </SettingRow>
            <SettingRow
              label="Tail Render Interval (ms)"
              description="Minimum milliseconds between tail window rerenders. (Default: 1000)"
              warning="Setting too low can result in poor performance with many tail windows open."
            >
              <NumberInput
                value={getSetting(settings, 'TailRenderInterval', 1000)}
                onChange={handleNumberChange('TailRenderInterval')}
                min={100}
                max={5000}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Sync Steam Achievements"
              description="Automatically sync unlocked achievements to Steam Cloud. Only used in Steam app. (Default: on)"
            >
              <Checkbox
                checked={getSetting(settings, 'SyncSteamAchievements', true)}
                onChange={handleBooleanChange('SyncSteamAchievements')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Remote File API */}
          <SettingGroup title="Remote File API">
            <SettingRow
              label="Hostname"
              description="Hostname to connect to for Remote API. Use [::1] for IPv6. (Default: localhost)"
            >
              <Input
                value={getSetting(settings, 'RemoteFileApiAddress', 'localhost')}
                onChange={handleStringChange('RemoteFileApiAddress')}
                className="w-32"
              />
            </SettingRow>
            <SettingRow
              label="Port"
              description="Port number for Remote API connection. Set to 0 to disable. (Default: 0)"
            >
              <NumberInput
                value={getSetting(settings, 'RemoteFileApiPort', 0)}
                onChange={handleNumberChange('RemoteFileApiPort')}
                min={0}
                max={65535}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Reconnection Delay (s)"
              description="Auto-reconnect delay in seconds after connection closes. Set to 0 to disable. (Default: 0)"
            >
              <NumberInput
                value={getSetting(settings, 'RemoteFileApiReconnectionDelay', 0)}
                onChange={handleNumberChange('RemoteFileApiReconnectionDelay')}
                min={0}
                max={60}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Use WSS"
              description="Use wss (secure WebSocket) instead of ws when connecting to RFA clients. (Default: off)"
            >
              <Checkbox
                checked={getSetting(settings, 'UseWssForRemoteFileApi', false)}
                onChange={handleBooleanChange('UseWssForRemoteFileApi')}
              />
            </SettingRow>
          </SettingGroup>
        </div>
      ) : (
        <Card title="General Settings" subtitle="No settings data available">
          <p className="text-terminal-dim">
            This save file does not contain settings data. Settings are typically created when
            you modify options in the game.
          </p>
        </Card>
      ),
    },
    {
      id: 'editor',
      label: 'Script Editor',
      content: hasSettings ? (
        <div className="space-y-6">
          {/* Header with Reset */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide">
              &gt; Script Editor Settings
            </h3>
            <ResetAction
              hasChanges={hasSettingsChanges()}
              onReset={resetSettings}
              title="Reset Settings"
            />
          </div>

          {/* Theme */}
          <SettingGroup title="Theme">
            <SettingRow
              label="Editor Theme"
              description="Color scheme for the script editor. (Default: Monokai)"
            >
              <Select
                options={MONACO_THEME_OPTIONS}
                value={getSetting(settings, 'MonacoTheme', 'monokai')}
                onChange={(value) => updateSettings({ MonacoTheme: String(value) })}
                showSearch={false}
                className="w-44"
              />
            </SettingRow>
          </SettingGroup>

          {/* Font Settings */}
          <SettingGroup title="Font">
            <SettingRow
              label="Font Family"
              description="Font used in the script editor. (Default: JetBrainsMono)"
            >
              <Input
                value={getSetting(settings, 'MonacoFontFamily', 'JetBrainsMono')}
                onChange={handleStringChange('MonacoFontFamily')}
                className="w-44"
              />
            </SettingRow>
            <SettingRow
              label="Font Size"
              description="Text size in pixels. (Default: 20)"
            >
              <NumberInput
                value={getSetting(settings, 'MonacoFontSize', 20)}
                onChange={handleNumberChange('MonacoFontSize')}
                min={8}
                max={72}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Font Ligatures"
              description="Enable ligatures for supported fonts (e.g., => becomes arrow). (Default: off)"
            >
              <Checkbox
                checked={getSetting(settings, 'MonacoFontLigatures', false)}
                onChange={handleBooleanChange('MonacoFontLigatures')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Indentation */}
          <SettingGroup title="Indentation">
            <SettingRow
              label="Insert Spaces"
              description="Use spaces instead of tabs for indentation. (Default: on)"
            >
              <Checkbox
                checked={getSetting(settings, 'MonacoInsertSpaces', true)}
                onChange={handleBooleanChange('MonacoInsertSpaces')}
              />
            </SettingRow>
            <SettingRow
              label="Tab Size"
              description="Number of spaces per indentation level. (Default: 2)"
            >
              <NumberInput
                value={getSetting(settings, 'MonacoTabSize', 2)}
                onChange={handleNumberChange('MonacoTabSize')}
                min={1}
                max={8}
                className="w-24"
              />
            </SettingRow>
            <SettingRow
              label="Detect Indentation"
              description="Auto-detect indentation settings per file based on content. (Default: off)"
            >
              <Checkbox
                checked={getSetting(settings, 'MonacoDetectIndentation', false)}
                onChange={handleBooleanChange('MonacoDetectIndentation')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Editor Behavior */}
          <SettingGroup title="Behavior">
            <SettingRow
              label="Vim Mode"
              description="Enable Vim keybindings by default when opening the editor. (Default: off)"
            >
              <Checkbox
                checked={getSetting(settings, 'MonacoDefaultToVim', false)}
                onChange={handleBooleanChange('MonacoDefaultToVim')}
              />
            </SettingRow>
            <SettingRow
              label="Word Wrap"
              description="How long lines should wrap in the editor. (Default: Off)"
            >
              <Select
                options={WORD_WRAP_OPTIONS}
                value={getSetting(settings, 'MonacoWordWrap', 'off')}
                onChange={(value) => updateSettings({ MonacoWordWrap: String(value) })}
                showSearch={false}
                className="w-44"
              />
            </SettingRow>
            <SettingRow
              label="Beautify on Save"
              description="Automatically format code when saving a file. (Default: off)"
            >
              <Checkbox
                checked={getSetting(settings, 'MonacoBeautifyOnSave', false)}
                onChange={handleBooleanChange('MonacoBeautifyOnSave')}
              />
            </SettingRow>
          </SettingGroup>

          {/* Cursor */}
          <SettingGroup title="Cursor">
            <SettingRow
              label="Cursor Style"
              description="Visual style of the text cursor. (Default: Line)"
            >
              <Select
                options={CURSOR_STYLE_OPTIONS}
                value={getSetting(settings, 'MonacoCursorStyle', 'line')}
                onChange={(value) => updateSettings({ MonacoCursorStyle: String(value) })}
                showSearch={false}
                className="w-44"
              />
            </SettingRow>
            <SettingRow
              label="Cursor Blinking"
              description="Animation style for the text cursor. (Default: Blink)"
            >
              <Select
                options={CURSOR_BLINKING_OPTIONS}
                value={getSetting(settings, 'MonacoCursorBlinking', 'blink')}
                onChange={(value) => updateSettings({ MonacoCursorBlinking: String(value) })}
                showSearch={false}
                className="w-44"
              />
            </SettingRow>
          </SettingGroup>
        </div>
      ) : (
        <Card title="Script Editor Settings" subtitle="No settings data available">
          <p className="text-terminal-dim">
            This save file does not contain settings data. Settings are typically created when
            you modify options in the game.
          </p>
        </Card>
      ),
    },
    {
      id: 'theme',
      label: 'Theme',
      content: hasSettings ? (
        <ThemeTabContent
          settings={settings}
          updateSettings={updateSettings}
          resetSettings={resetSettings}
          hasSettingsChanges={hasSettingsChanges}
        />
      ) : (
        <Card title="Theme Settings" subtitle="No settings data available">
          <p className="text-terminal-dim">
            This save file does not contain settings data. Settings are typically created when
            you modify options in the game.
          </p>
        </Card>
      ),
    },
  ];

  return (
    <Card
      title="Settings"
      subtitle={hasSettings ? 'Game settings loaded' : 'No settings data'}
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
              {hasSettings && (
                <>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Autosave:</span>
                    <span className="text-terminal-secondary">
                      {getSetting(settings, 'AutosaveInterval', 60)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Locale:</span>
                    <span className="text-terminal-secondary">
                      {getSetting(settings, 'Locale', 'en')}
                    </span>
                  </div>
                </>
              )}
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
              {hasSettings && (
                <>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Theme:</span>
                    <span className="text-terminal-secondary">
                      {MONACO_THEME_OPTIONS.find(o => o.value === getSetting(settings, 'MonacoTheme', 'monokai'))?.label || 'Monokai'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Font:</span>
                    <span className="text-terminal-secondary">
                      {getSetting(settings, 'MonacoFontFamily', 'JetBrainsMono')} {getSetting(settings, 'MonacoFontSize', 20)}px
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Vim Mode:</span>
                    <span className="text-terminal-secondary">
                      {getSetting(settings, 'MonacoDefaultToVim', false) ? 'On' : 'Off'}
                    </span>
                  </div>
                </>
              )}
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
              {hasSettings && (
                <>
                  <div className="flex justify-between">
                    <span className="text-terminal-dim">Custom Theme:</span>
                    <span className="text-terminal-secondary">
                      {getSetting(settings, 'theme', null) ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {/* Color preview swatches */}
                  {(() => {
                    const theme = (getSetting(settings, 'theme', null) ?? {}) as Partial<ITheme>;
                    const getColor = (key: keyof ITheme) => theme[key] ?? DEFAULT_THEME[key];
                    return (
                      <div className="mt-2">
                        <span className="text-terminal-dim text-xs">Colors:</span>
                        <div className="flex gap-1 mt-1">
                          <div
                            className="w-4 h-4 rounded-sm border border-terminal-dim/50"
                            style={{ backgroundColor: getColor('primary') }}
                            title="Primary"
                          />
                          <div
                            className="w-4 h-4 rounded-sm border border-terminal-dim/50"
                            style={{ backgroundColor: getColor('success') }}
                            title="Success"
                          />
                          <div
                            className="w-4 h-4 rounded-sm border border-terminal-dim/50"
                            style={{ backgroundColor: getColor('error') }}
                            title="Error"
                          />
                          <div
                            className="w-4 h-4 rounded-sm border border-terminal-dim/50"
                            style={{ backgroundColor: getColor('warning') }}
                            title="Warning"
                          />
                          <div
                            className="w-4 h-4 rounded-sm border border-terminal-dim/50"
                            style={{ backgroundColor: getColor('info') }}
                            title="Info"
                          />
                          <div
                            className="w-4 h-4 rounded-sm border border-terminal-dim/50"
                            style={{ backgroundColor: getColor('hp') }}
                            title="HP"
                          />
                          <div
                            className="w-4 h-4 rounded-sm border border-terminal-dim/50"
                            style={{ backgroundColor: getColor('money') }}
                            title="Money"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="general" />
      </div>
    </Card>
  );
}
