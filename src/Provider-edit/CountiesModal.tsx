import React, { useState, useCallback } from 'react';
import './CountiesModal.css';
import { CountiesServed } from '@/Utility/Types';



const CountiesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedCounties: CountiesServed[];
    setSelectedCounties: React.Dispatch<React.SetStateAction<CountiesServed[]>>;
    providerCounties: CountiesServed[];
}> = ({ isOpen, onClose, selectedCounties, setSelectedCounties, providerCounties }) => {
    const [checkedCounties, setCheckedCounties] =  useState<string[]>([])    
    const countiesOptions = [
        'Beaver', 'Box Elder', 'Cache', 'Carbon', 'Daggett',
        'Davis', 'Duchesne', 'Emery', 'Garfield', 'Grand',
        'Iron', 'Juab', 'Kane', 'Millard', 'Morgan',
        'Piute', 'Rich', 'Salt Lake', 'San Juan', 'Sanpete',
        'Sevier', 'Summit', 'Tooele', 'Uintah', 'Utah',
        'Wasatch', 'Washington', 'Wayne', 'Weber'
    ];

    const parsedProviderCounties = React.useMemo(() => {
        if (!providerCounties || !providerCounties.length) return [];
        
        return providerCounties[0].county?.split(',').map(county => county.trim()) || [];
      }, [providerCounties]);
    
      const handleSelect = useCallback((value: string) => {
        setCheckedCounties(prev =>
          prev.includes(value)
            ? prev.filter(item => item !== value)
            : [...prev, value]
        );
      }, []);
    
      const isCountyChecked = useCallback(
        (value: string) =>
          checkedCounties.includes(value) ||
          parsedProviderCounties.includes(value),
        [checkedCounties, parsedProviderCounties]
      );
    
      const handleSubmit = () => {
        const selectedCounties = countiesOptions
          .filter(option => checkedCounties.includes(option))
          .map(option => ({ county: option }));
    
        setSelectedCounties(selectedCounties);
        onClose();
      };
    
      if (!isOpen) return null;
    
      return (
        <>
          <div className="modal-backdrop" onClick={onClose}></div>
          <div className="modal">
            <h2>Select Counties</h2>
            <div className="counties-options">
              {countiesOptions.map(option => (
                <div key={option} className="county-option">
                  <input
                    type="checkbox"
                    checked={isCountyChecked(option)}
                    onChange={() => handleSelect(option)}
                    id={`county-${option}`}
                  />
                  <label htmlFor={`county-${option}`}>{option}</label>
                </div>
              ))}
            </div>
            <button className="counties-options-button" onClick={handleSubmit}>
              Save
            </button>
            <button className="counties-options-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      );
    };

export default CountiesModal;