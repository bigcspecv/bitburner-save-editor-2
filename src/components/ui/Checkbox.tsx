import { InputHTMLAttributes, forwardRef, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  triState?: boolean;
  state?: 'checked' | 'unchecked' | 'indeterminate';
  onStateChange?: (next: 'checked' | 'unchecked' | 'indeterminate') => void;
}

/**
 * Terminal-styled checkbox component with ASCII-style appearance.
 * Supports both dual-state (default) and tri-state (unchecked/indeterminate/checked) modes.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, label, disabled, checked, defaultChecked, onChange, triState, state, onStateChange, ...props },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = (node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        // @ts-expect-error - React will handle the assignment
        ref.current = node;
      }
    };

    const [isChecked, setIsChecked] = useState(defaultChecked || checked || false);

    const currentState: 'checked' | 'unchecked' | 'indeterminate' = triState
      ? state ?? (checked ?? isChecked ? 'checked' : 'unchecked')
      : (checked ?? isChecked) ? 'checked' : 'unchecked';

    // Sync with controlled checked prop
    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    // Sync tri-state prop
    useEffect(() => {
      if (triState && state !== undefined) {
        setIsChecked(state === 'checked');
      }
    }, [state, triState]);

    // Apply native indeterminate state when triState is enabled
    useEffect(() => {
      if (inputRef.current && triState) {
        inputRef.current.indeterminate = currentState === 'indeterminate';
      }
    }, [currentState, triState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        if (triState) {
          const nextState =
            currentState === 'checked'
              ? 'unchecked'
              : currentState === 'indeterminate'
              ? 'checked'
              : 'checked';
          setIsChecked(nextState === 'checked');
          onStateChange?.(nextState);
          onChange?.(e);
        } else {
          const newChecked = e.target.checked;
          setIsChecked(newChecked);
          onChange?.(e);
        }
      }
    };

    const renderMark = () => {
      if (currentState === 'checked') {
        return (
          <span className="text-terminal-primary text-lg font-bold leading-none">
            X
          </span>
        );
      }
      if (currentState === 'indeterminate') {
        return (
          <span className="text-terminal-secondary text-lg font-bold leading-none">
            -
          </span>
        );
      }
      return null;
    };

    return (
      <label
        className={clsx(
          'flex items-center gap-2 cursor-pointer group font-mono relative',
          { 'opacity-50 cursor-not-allowed': disabled },
          className
        )}
      >
        <input
          ref={mergedRef}
          type="checkbox"
          disabled={disabled}
          checked={triState ? currentState === 'checked' : checked}
          defaultChecked={triState ? undefined : defaultChecked}
          onChange={handleChange}
          className="sr-only"
          aria-checked={
            triState
              ? currentState === 'indeterminate'
                ? 'mixed'
                : currentState === 'checked'
                ? true
                : false
              : undefined
          }
          {...props}
        />
        {/* Custom checkbox appearance */}
        <div
          className={clsx(
            'w-5 h-5 border-2 border-terminal-primary bg-black',
            'flex items-center justify-center transition-colors',
            'group-hover:border-terminal-secondary',
            { 'cursor-not-allowed': disabled }
          )}
        >
          {renderMark()}
        </div>
        {label && (
          <span
            className={clsx(
              'text-terminal-primary text-sm select-none',
              'group-hover:text-terminal-secondary transition-colors',
              { 'cursor-not-allowed': disabled }
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
