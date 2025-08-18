import React, { useState, useEffect, useRef, useMemo } from 'react';

interface InsuranceInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  categoryId?: string;
}

const InsuranceInput: React.FC<InsuranceInputProps> = ({ 
  value = [], 
  onChange, 
  placeholder = "Select or type insurance options...",
  multiple = true,
  categoryId
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Popular insurance options for suggestions
  const popularInsurances = useMemo(() => [
    'Medicaid',
    'Medicare',
    'Blue Cross Blue Shield',
    'Aetna',
    'Cigna',
    'UnitedHealth',
    'Humana',
    'Kaiser Permanente',
    'Anthem',
    'Health Net',
    'Molina Healthcare',
    'Amerigroup',
    'WellCare',
    'Centene',
    'School District',
    'Self-Pay',
    'Sliding Scale',
    'Private Insurance',
    'Tricare',
    'VA Benefits'
  ], []);

  // Load popular insurances on mount
  useEffect(() => {
    setSuggestions(popularInsurances);
  }, [popularInsurances]);

  // Search insurances as user types
  const searchInsurances = async (query: string) => {
    if (query.length < 2) {
      setSuggestions(popularInsurances);
      return;
    }

    setLoading(true);
    try {
      // Filter popular insurances based on query
      const filtered = popularInsurances.filter(insurance =>
        insurance.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } catch (error) {
      console.error('Failed to search insurances:', error);
      setSuggestions(popularInsurances);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim()) {
      searchInsurances(newValue);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions(popularInsurances);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    if (multiple) {
      // Add to existing values if not already present
      if (!value.includes(suggestion)) {
        onChange([...value, suggestion]);
      }
    } else {
      // Single selection
      onChange([suggestion]);
    }
    
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle custom insurance addition
  const handleCustomInsurance = () => {
    const customValue = inputValue.trim();
    if (customValue && !value.includes(customValue)) {
      if (multiple) {
        onChange([...value, customValue]);
      } else {
        onChange([customValue]);
      }
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  // Handle key press (Enter to add custom)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleCustomInsurance();
    }
  };

  // Remove insurance
  const removeInsurance = (insuranceToRemove: string) => {
    onChange(value.filter(insurance => insurance !== insuranceToRemove));
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="insurance-input-container">
      {/* Selected Insurance Tags */}
      {value.length > 0 && (
        <div className="selected-insurances">
          {value.map((insurance, index) => (
            <span key={index} className="insurance-tag">
              {insurance}
              <button
                type="button"
                onClick={() => removeInsurance(insurance)}
                className="remove-btn"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="insurance-input"
        />
        
        {/* Add Custom Button */}
        {inputValue.trim() && (
          <button
            type="button"
            onClick={handleCustomInsurance}
            className="add-custom-btn"
          >
            Add "{inputValue}"
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {loading ? (
            <div className="loading">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))
          ) : inputValue.length >= 2 ? (
            <div className="no-results">
              No matches found. Press Enter to add "{inputValue}"
            </div>
          ) : (
            <div className="popular-insurances">
              <div className="popular-header">Popular Options:</div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item popular"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsuranceInput;
