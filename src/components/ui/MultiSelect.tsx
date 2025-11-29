import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  placeholder?: string;
}

/**
 * Terminal-styled multi-select combobox with search/filter functionality
 * Users can type to filter options and select multiple items
 */
export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(
  ({ className, label, options, value = [], onChange, placeholder = 'Search...', disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValues, setSelectedValues] = useState<string[]>(value);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync with controlled value prop
    useEffect(() => {
      setSelectedValues(value);
    }, [value]);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get selected option labels
    const selectedLabels = options.filter(opt => selectedValues.includes(opt.value));

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
        setIsOpen(!isOpen);
        if (!isOpen) {
          setSearchTerm('');
        }
      }
    };

    const handleSelect = (optionValue: string) => {
      if (disabled) return;

      const newSelected = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];

      setSelectedValues(newSelected);
      onChange?.(newSelected);
      setSearchTerm('');
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      const newSelected = selectedValues.filter(v => v !== optionValue);
      setSelectedValues(newSelected);
      onChange?.(newSelected);
    };

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-terminal-secondary text-sm mb-1 font-mono uppercase tracking-wide">
            {label}
          </label>
        )}

        {/* Hidden input for form compatibility */}
        <input
          ref={ref}
          type="hidden"
          value={selectedValues.join(',')}
          {...props}
        />

        <div className="relative">
          {/* Collapsed view with selected items */}
          {!isOpen && (
            <div
              onClick={handleToggle}
              className={clsx(
                'min-h-[42px] bg-black border border-terminal-primary px-3 py-2',
                'flex flex-wrap gap-2 items-center cursor-pointer',
                'hover:border-terminal-secondary transition-colors',
                { 'opacity-50 cursor-not-allowed': disabled },
                className
              )}
            >
              {selectedLabels.length === 0 ? (
                <span className="text-terminal-dim font-mono text-sm">{placeholder}</span>
              ) : (
                selectedLabels.map(option => (
                  <span
                    key={option.value}
                    className="bg-terminal-primary text-black px-2 py-1 text-xs font-mono inline-flex items-center gap-1"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(option.value, e)}
                      className="hover:text-red-600 font-bold"
                      disabled={disabled}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          )}

          {/* Expanded view with search and options */}
          {isOpen && (
            <div className="border border-terminal-primary bg-black">
              {/* Search input */}
              <div className="p-2 border-b border-terminal-primary">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                  className="w-full bg-black border border-terminal-primary text-terminal-primary px-3 py-2 font-mono text-sm focus:outline-none focus:border-terminal-secondary placeholder-terminal-dim"
                />
              </div>

              {/* Selected items display */}
              {selectedLabels.length > 0 && (
                <div className="p-2 border-b border-terminal-primary flex flex-wrap gap-2">
                  {selectedLabels.map(option => (
                    <span
                      key={option.value}
                      className="bg-terminal-primary text-black px-2 py-1 text-xs font-mono inline-flex items-center gap-1"
                    >
                      {option.label}
                      <button
                        type="button"
                        onClick={(e) => handleRemove(option.value, e)}
                        className="hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
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
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={clsx(
                          'px-3 py-2 cursor-pointer font-mono text-sm flex items-center gap-2',
                          'hover:bg-terminal-primary hover:text-black transition-colors',
                          {
                            'bg-terminal-dim text-black': isSelected,
                            'text-terminal-primary': !isSelected,
                          }
                        )}
                      >
                        <span className="w-4 h-4 border-2 border-terminal-primary bg-black flex items-center justify-center">
                          {isSelected && <span className="text-terminal-primary text-sm">×</span>}
                        </span>
                        {option.label}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Close button */}
              <div className="p-2 border-t border-terminal-primary">
                <button
                  type="button"
                  onClick={handleToggle}
                  className="w-full px-4 py-2 bg-black border border-terminal-primary text-terminal-primary font-mono uppercase tracking-wider hover:bg-terminal-dim hover:text-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
