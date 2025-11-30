import {
  InputHTMLAttributes,
  KeyboardEvent,
  MutableRefObject,
  forwardRef,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  clearOnFocus?: boolean;
}

/**
 * Terminal-styled input component
 * Supports labels and error states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', onKeyDown, clearOnFocus, onFocus, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hasBeenFocused, setHasBeenFocused] = useState(false);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (clearOnFocus && !hasBeenFocused) {
        // Clear the input value
        e.target.value = '';
        setHasBeenFocused(true);
        // Trigger onChange to update parent state
        if (props.onChange) {
          const syntheticEvent = {
            ...e,
            target: e.target,
            currentTarget: e.currentTarget,
          } as React.ChangeEvent<HTMLInputElement>;
          props.onChange(syntheticEvent);
        }
      }
      onFocus?.(e);
    };

    const assignRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-terminal-secondary text-sm mb-1 font-mono uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={assignRef}
          type={type}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={clsx(
            'w-full bg-black border text-terminal-primary px-3 py-2',
            'focus:outline-none focus:ring-1 font-mono',
            'placeholder-terminal-dim',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            {
              'border-terminal-primary focus:border-terminal-secondary focus:ring-terminal-secondary':
                !error,
              'border-red-500 focus:border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1 font-mono">&gt; ERROR: {error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
