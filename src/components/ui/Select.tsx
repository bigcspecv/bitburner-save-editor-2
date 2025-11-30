import { SelectHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  showSearch?: boolean;
}

/**
 * Terminal-styled select/dropdown component with search functionality
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, value, onChange, placeholder = 'Select...', showSearch = true, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState<string | number | undefined>(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Sync with controlled value prop
    useEffect(() => {
      setSelectedValue(value);
    }, [value]);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get selected option label
    const selectedLabel = options.find(opt => opt.value === selectedValue)?.label;

    // Handle clicking outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleToggle = () => {
      if (!disabled) {
        const willOpen = !isOpen;
        setIsOpen(willOpen);
        if (!willOpen) {
          setSearchTerm('');
        } else if (triggerRef.current) {
          // Calculate dropdown position when opening
          const rect = triggerRef.current.getBoundingClientRect();
          const dropdownWidth = Math.max(rect.width, 200);
          setDropdownPosition({
            top: rect.top, // Position at the same top as trigger
            left: rect.right - dropdownWidth, // Align right edges
            width: dropdownWidth,
          });
        }
      }
    };

    const handleSelect = (optionValue: string | number) => {
      if (disabled) return;

      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    };

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-terminal-secondary text-sm mb-1 font-mono uppercase tracking-wide">
            {label}
          </label>
        )}

        {/* Hidden select for form compatibility */}
        <select
          ref={ref}
          value={selectedValue || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className="sr-only"
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative">
          {/* Collapsed view */}
          <div
            ref={triggerRef}
            onClick={handleToggle}
            className={clsx(
              'w-full bg-black border px-3 py-2 cursor-pointer font-mono',
              'hover:border-terminal-secondary transition-colors',
              {
                'border-terminal-primary': !error && !isOpen,
                'border-terminal-secondary': isOpen,
                'border-red-500': error,
                'opacity-50 cursor-not-allowed': disabled,
              },
              className
            )}
          >
            <span className={selectedLabel ? 'text-terminal-primary' : 'text-terminal-dim'}>
              {selectedLabel || placeholder}
            </span>
          </div>
        </div>

        {/* Expanded view with search and options - rendered with fixed positioning */}
        {isOpen && (
          <div
            className={clsx(
              'fixed border bg-black z-50',
              {
                'border-terminal-primary': !error,
                'border-red-500': error,
              }
            )}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${Math.max(dropdownPosition.width, 200)}px`, // Minimum width of 200px
              minWidth: '200px',
            }}
          >
            {/* Search input */}
            {showSearch && (
              <div className="p-2 border-b border-terminal-primary">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="w-full bg-black border border-terminal-primary text-terminal-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-terminal-secondary placeholder-terminal-dim"
                />
              </div>
            )}

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-terminal-dim font-mono text-sm">
                  No options found
                </div>
              ) : (
                filteredOptions.map(option => {
                  const isSelected = selectedValue === option.value;
                  const isDisabled = option.disabled || disabled;
                  return (
                    <div
                      key={option.value}
                      onClick={() => {
                        if (!isDisabled) handleSelect(option.value);
                      }}
                      className={clsx(
                        'px-3 py-2 cursor-pointer font-mono text-sm',
                        'hover:bg-terminal-primary hover:text-black transition-colors',
                        {
                          'bg-terminal-dim text-black': isSelected,
                          'text-terminal-primary': !isSelected && !isDisabled,
                          'text-terminal-dim cursor-not-allowed opacity-60': isDisabled,
                        }
                      )}
                    >
                      {option.label}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs mt-1 font-mono">&gt; ERROR: {error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
