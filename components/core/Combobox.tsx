import React from 'react';

interface ComboboxOption {
  value: string;
  label: string;
  avatar?: string | null;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  allowCustom?: boolean;
  multiple?: boolean;
  placeholder?: string;
  loading?: boolean;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  allowCustom = false,
  multiple = false,
  placeholder = '',
  loading = false,
  renderOption,
}) => {
  // Minimal implementation for demo; replace with a real combobox/autocomplete in production
  const [input, setInput] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Quiet debug logs (remove console noise)
  React.useEffect(() => {
  }, [options, value, multiple, allowCustom, placeholder, loading]);

  // Quiet debug logs
  React.useEffect(() => {
  }, [input, show, value]);

  // Validation and debugging helper
  const validateComponentState = () => {
    const issues = [];
    
    if (!Array.isArray(options)) {
      issues.push('Options is not an array');
    } else {
      options.forEach((option, index) => {
        if (!option || typeof option !== 'object') {
          issues.push(`Option at index ${index} is not an object`);
        } else {
          if (typeof option.value !== 'string') {
            issues.push(`Option at index ${index} has invalid value type: ${typeof option.value}`);
          }
          if (typeof option.label !== 'string') {
            issues.push(`Option at index ${index} has invalid label type: ${typeof option.label}`);
          }
        }
      });
    }
    
    if (multiple) {
      if (!Array.isArray(value)) {
        issues.push('Multiple mode but value is not an array');
      }
    } else {
      if (typeof value !== 'string' && value !== null && value !== undefined) {
        issues.push(`Single mode but value is not a string: ${typeof value}`);
      }
    }
    
    if (Array.isArray(options)) {
      const values = options.map(o => o.value);
      const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
      if (duplicates.length > 0) {
        issues.push(`Duplicate option values found: ${duplicates.join(', ')}`);
      }
    }
    
    // Quiet debug logs
    
    return issues;
  };

  // Run validation on mount and when key props change
  React.useEffect(() => {
    validateComponentState();
  }, [options, value, multiple]);

  // Sync input state with value prop for single-select
  React.useEffect(() => {
    if (!multiple && typeof value === 'string' && value && !show) {
      // Don't set input here - let getInputValue() handle the display
    }
  }, [value, multiple, show]);

  // Helper function for robust option matching
  const findMatchingOption = (searchValue: string, options: ComboboxOption[]) => {
    if (!searchValue || !Array.isArray(options)) return null;
    
    // Quiet debug logs
    
    // Try multiple matching strategies
    for (const option of options) {
      const strategies = {
        exact: option.value === searchValue,
        caseInsensitive: option.value.toLowerCase() === searchValue.toLowerCase(),
        partial: option.value.toLowerCase().includes(searchValue.toLowerCase()),
        reversePartial: searchValue.toLowerCase().includes(option.value.toLowerCase()),
        slugified: (() => {
          const slugSearch = searchValue.toLowerCase().replace(/\s+/g, '-');
          const slugOption = option.value.toLowerCase().replace(/\s+/g, '-');
          return slugOption === slugSearch || 
                 slugOption.includes(slugSearch) ||
                 slugSearch.includes(slugOption);
        })(),
        // Additional strategy: check if searchValue is a "slug" of the option
        slugMatch: (() => {
          const words = option.value.toLowerCase().split(/\s+/);
          const searchWords = searchValue.toLowerCase().split(/[-_\s]+/);
          return searchWords.every(word => words.some(optionWord => optionWord.includes(word)));
        })()
      };
      
      const hasMatch = Object.values(strategies).some(Boolean);
      
      // Quiet debug logs
      
      if (hasMatch) {
        return option;
      }
    }
    
    // Quiet debug logs
    return null;
  };

  const filtered = input
    ? options.filter(o => o.label.toLowerCase().includes(input.toLowerCase()))
    : options;

  const handleSelect = (option: ComboboxOption) => {

    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (!arr.includes(option.value)) {
        const newArray = [...arr, option.value];
        onChange(newArray);
      }
      setInput('');
    } else {
      onChange(option.value);
      setInput(''); // Clear input since we'll show the label via getInputValue
      setShow(false);
      // Blur input to close dropdown
      inputRef.current?.blur();
    }
  };

  const handleRemove = (val: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== val));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && allowCustom && input.trim()) {
      if (multiple) {
        const arr = Array.isArray(value) ? value : [];
        if (!arr.includes(input.trim())) {
          onChange([...arr, input.trim()]);
        }
        setInput('');
      } else {
        onChange(input.trim());
        setInput(input.trim());
        setShow(false);
        inputRef.current?.blur();
      }
    }
  };

  const getInputValue = () => {

    if (multiple) {
      return input;
    }
    
    if (show) {
      return input;
    }
    
    if (typeof value === 'string' && value) {
      
      // Use the robust matching helper
      const selectedOption = findMatchingOption(value, options);
      
      if (selectedOption) {
        return selectedOption.label;
      } else {
        return value;
      }
    }
    
    return '';
  };

  return (
    <div className="relative">
      {/* Debug Panel Toggle */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {showDebugPanel ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      )}
      
      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && showDebugPanel && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Combobox Debug Info</h4>
          <div className="space-y-1 text-yellow-700 dark:text-yellow-300">
            <div><strong>Value:</strong> {JSON.stringify(value)}</div>
            <div><strong>Input:</strong> "{input}"</div>
            <div><strong>Show:</strong> {show ? 'true' : 'false'}</div>
            <div><strong>Multiple:</strong> {multiple ? 'true' : 'false'}</div>
            <div><strong>Display Value:</strong> "{getInputValue()}"</div>
            <div><strong>Options Count:</strong> {options?.length || 0}</div>
            <div><strong>Filtered Count:</strong> {filtered?.length || 0}</div>
            <div><strong>Selected Option:</strong> {(() => {
              if (typeof value === 'string' && value) {
                const selected = options.find(o => o.value === value);
                return selected ? JSON.stringify({ value: selected.value, label: selected.label }) : 'Not found';
              }
              return 'N/A';
            })()}</div>
          </div>
        </div>
      )}
      
      {multiple && Array.isArray(value) && (
        <div className="flex flex-wrap gap-1 mb-1">
          {value.map(val => (
            <span key={val} className="inline-flex items-center px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-xs rounded-full">
              {val}
              <button type="button" className="ml-1 text-red-500" onClick={() => handleRemove(val)}>&times;</button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
        placeholder={placeholder}
        value={getInputValue()}
        onChange={e => { 
          setInput(e.target.value); 
          setShow(true); 
        }}
        onFocus={() => {
          setShow(true);
        }}
        onBlur={() => { 
          setShow(false); 
          if (multiple) {
            setInput('');
          }
        }}
        onKeyDown={handleInputKeyDown}
        disabled={loading}
        autoComplete="off"
      />
      {show && (filtered.length > 0 || (allowCustom && input.trim())) && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg max-h-48 overflow-auto">
          {filtered.map(option => {
            const isSelected = multiple
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value;
            return (
              <div
                key={option.value}
                className={
                  'px-3 py-2 cursor-pointer flex items-center ' +
                  (isSelected
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/30')
                }
                onMouseDown={() => handleSelect(option)}
              >
                {renderOption ? renderOption(option) : option.label}
                {isSelected && (
                  <span className="ml-auto text-blue-500 dark:text-blue-300">✓</span>
                )}
              </div>
            );
          })}
          {allowCustom && input.trim() && !filtered.some(o => o.value === input.trim()) && (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"
              onMouseDown={() => handleSelect({ value: input.trim(), label: input.trim() })}
            >
              Add "{input.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
