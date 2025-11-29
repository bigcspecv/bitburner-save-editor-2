import {
  InputHTMLAttributes,
  forwardRef,
  useState,
  useEffect,
  useRef,
} from 'react';
import type { ChangeEvent, KeyboardEvent, MutableRefObject } from 'react';
import clsx from 'clsx';
import { Button } from './Button';

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showButtons?: boolean;
}

/**
 * Terminal-styled numeric input with increment/decrement buttons
 * Supports min/max validation and step increments
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({
    className,
    label,
    error,
    value = 0,
    onChange,
    min,
    max,
    step = 1,
    showButtons = true,
    disabled,
    ...props
  }, ref) => {
    // Track the raw input string to allow free typing
    const [inputValue, setInputValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync inputValue when value prop changes externally
    useEffect(() => {
      setInputValue(value.toString());
    }, [value]);

    const handleIncrement = () => {
      if (disabled) return;
      const newValue = value + step;
      if (max !== undefined && newValue > max) return;
      onChange?.(newValue);
      setInputValue(newValue.toString());
    };

    const handleDecrement = () => {
      if (disabled) return;
      const newValue = value - step;
      if (min !== undefined && newValue < min) return;
      onChange?.(newValue);
      setInputValue(newValue.toString());
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      // Allow free typing without immediate validation
      setInputValue(e.target.value);
    };

    const applyValue = () => {
      // Validate and constrain on blur/enter
      const numValue = parseFloat(inputValue);

      if (isNaN(numValue) || inputValue === '') {
        // Reset to current value if invalid
        setInputValue(value.toString());
        return;
      }

      // Apply min/max constraints
      let constrainedValue = numValue;
      if (min !== undefined && constrainedValue < min) {
        constrainedValue = min;
      }
      if (max !== undefined && constrainedValue > max) {
        constrainedValue = max;
      }

      // Update the value
      onChange?.(constrainedValue);
      setInputValue(constrainedValue.toString());
    };

    const handleBlur = () => {
      applyValue();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyValue();
        inputRef.current?.blur();
      }
    };

    const assignRefs = (node: HTMLInputElement | null) => {
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

        <div className="flex items-stretch">
          {showButtons && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleDecrement}
              disabled={disabled || (min !== undefined && value <= min)}
              className="rounded-none border-r-0 px-3"
            >
              -
            </Button>
          )}

          <input
            ref={assignRefs}
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={clsx(
              'bg-black border text-terminal-primary px-3 py-2 text-center',
              'focus:outline-none focus:ring-1 font-mono',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Remove spinner arrows in Chrome/Safari/Edge
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              {
                'border-terminal-primary focus:border-terminal-secondary focus:ring-terminal-secondary':
                  !error,
                'border-red-500 focus:border-red-500 focus:ring-red-500': error,
                'flex-1': showButtons,
                'w-full': !showButtons,
                'border-r-0': showButtons,
              },
              className
            )}
            {...props}
          />

          {showButtons && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && value >= max)}
              className="rounded-none px-3"
            >
              +
            </Button>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-xs mt-1 font-mono">&gt; ERROR: {error}</p>
        )}

        {(min !== undefined || max !== undefined) && !error && (
          <p className="text-terminal-dim text-xs mt-1 font-mono">
            {min !== undefined && max !== undefined
              ? `Range: ${min} - ${max}`
              : min !== undefined
              ? `Min: ${min}`
              : `Max: ${max}`}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
