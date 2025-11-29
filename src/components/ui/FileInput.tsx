import { InputHTMLAttributes, useRef } from 'react';
import clsx from 'clsx';
import { Button } from './Button';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  buttonText?: string;
  showFilename?: boolean;
}

/**
 * Terminal-styled file input component
 * Provides a styled button instead of the default browser file input
 */
export function FileInput({
  className,
  label,
  error,
  buttonText = 'Choose File',
  showFilename = true,
  onChange,
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedFile = inputRef.current?.files?.[0];

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-terminal-secondary text-sm mb-1 font-mono uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Hidden native input */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onChange}
          {...props}
        />

        {/* Styled button */}
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          variant="primary"
        >
          {buttonText}
        </Button>

        {/* Show selected filename */}
        {showFilename && (
          <span className="text-terminal-primary font-mono text-sm">
            {selectedFile ? (
              <span className="text-terminal-secondary">{selectedFile.name}</span>
            ) : (
              <span className="text-terminal-dim">No file selected</span>
            )}
          </span>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1 font-mono">&gt; ERROR: {error}</p>
      )}
    </div>
  );
}
