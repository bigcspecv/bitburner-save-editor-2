import { useState, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';

export interface ColorInputProps {
  /** Current hex color value (e.g., "#0c0" or "#00cc00") */
  value: string;
  /** Called when the color changes */
  onChange: (value: string) => void;
  /** Optional label */
  label?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Show mini preview only (no text input) */
  compact?: boolean;
}

/** Regex for valid hex colors: #RGB, #RRGGBB, or #RRGGBBAA */
const HEX_COLOR_REGEX = /^#(([0-9A-Fa-f]{3})|([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?)$/;

/** Normalize 3-char hex to 6-char for native color picker */
function normalizeHex(hex: string): string {
  if (!hex) return '#000000';
  // Strip # prefix
  const h = hex.replace('#', '');
  // Expand 3-char to 6-char
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  }
  // For 8-char (with alpha), truncate to 6
  if (h.length === 8) {
    return `#${h.slice(0, 6)}`;
  }
  return `#${h}`;
}

/** Validate hex color string */
function isValidHex(hex: string): boolean {
  return HEX_COLOR_REGEX.test(hex);
}

/**
 * Terminal-styled color input with hex text field and color picker
 */
export function ColorInput({
  value,
  onChange,
  label,
  disabled = false,
  className,
  compact = false,
}: ColorInputProps) {
  const [textValue, setTextValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes when not editing
  useEffect(() => {
    if (!isEditing) {
      setTextValue(value);
    }
  }, [value, isEditing]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setTextValue(newValue);

      // Auto-prepend # if missing
      let normalized = newValue;
      if (normalized && !normalized.startsWith('#')) {
        normalized = '#' + normalized;
      }

      // Only update parent if valid
      if (isValidHex(normalized)) {
        onChange(normalized);
      }
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Reset to valid value on blur if invalid
    if (!isValidHex(textValue)) {
      setTextValue(value);
    }
  }, [textValue, value]);

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      setTextValue(newColor);
      onChange(newColor);
    },
    [onChange]
  );

  const handleSwatchClick = useCallback(() => {
    if (!disabled) {
      colorInputRef.current?.click();
    }
  }, [disabled]);

  const isValid = isValidHex(textValue);

  if (compact) {
    return (
      <div className={clsx('relative inline-flex items-center', className)}>
        {/* Color swatch */}
        <button
          type="button"
          onClick={handleSwatchClick}
          disabled={disabled}
          className={clsx(
            'w-6 h-6 border border-terminal-dim rounded-sm',
            'focus:outline-none focus:ring-1 focus:ring-terminal-secondary',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ backgroundColor: isValid ? normalizeHex(textValue) : '#000' }}
          title={value}
        />
        {/* Hidden native color picker */}
        <input
          ref={colorInputRef}
          type="color"
          value={normalizeHex(value)}
          onChange={handleColorPickerChange}
          disabled={disabled}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <div className={clsx('inline-flex items-center gap-2', className)}>
      {label && (
        <label className="block text-terminal-secondary text-sm mb-1 font-mono uppercase tracking-wide">
          {label}
        </label>
      )}
      {/* Color swatch button */}
      <button
        type="button"
        onClick={handleSwatchClick}
        disabled={disabled}
        className={clsx(
          'w-7 h-7 border border-terminal-dim rounded-sm flex-shrink-0',
          'focus:outline-none focus:ring-1 focus:ring-terminal-secondary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        style={{ backgroundColor: isValid ? normalizeHex(textValue) : '#000' }}
        title="Click to open color picker"
      />
      {/* Hidden native color picker */}
      <input
        ref={colorInputRef}
        type="color"
        value={normalizeHex(value)}
        onChange={handleColorPickerChange}
        disabled={disabled}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
      />
      {/* Text input for hex value */}
      <input
        ref={inputRef}
        type="text"
        value={textValue}
        onChange={handleTextChange}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="#000000"
        className={clsx(
          'w-20 bg-black border text-terminal-primary px-2 py-1',
          'focus:outline-none focus:ring-1 font-mono text-xs',
          'placeholder-terminal-dim',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'border-terminal-dim focus:border-terminal-secondary focus:ring-terminal-secondary':
              isValid,
            'border-red-500 focus:border-red-500 focus:ring-red-500': !isValid,
          }
        )}
      />
    </div>
  );
}

ColorInput.displayName = 'ColorInput';
