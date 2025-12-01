import { Card, Tabs, Checkbox, NumberInput, Input, ResetAction, Select } from '../ui';
import type { SelectOption } from '../ui/Select';
import { useSaveStore } from '../../store/save-store';
import type { SettingsSave } from '../../models/schemas/misc';

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
      notImplemented: true,
      content: (
        <Card title="Theme Settings" subtitle="Not yet implemented">
          <p className="text-terminal-dim">
            {hasSettings
              ? 'Theme data exists but color editors require additional implementation.'
              : 'No settings data in save file.'}
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
              {hasSettings && getSetting(settings, 'theme', null) && (
                <div className="flex justify-between">
                  <span className="text-terminal-dim">Custom Theme:</span>
                  <span className="text-terminal-secondary">Yes</span>
                </div>
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
