import React from 'react';

interface ProgressBarProps {
  bgcolor: string;
  fillAmount: number; 
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ bgcolor, fillAmount, height }) => {
  const parentStyle = {
    backgroundColor: '#eee', 
    borderRadius: '12px',
    height: height || '20px',
    width: '100%',
  };

  const childStyle = {
    backgroundColor: fillAmount >= 100 ? 'green' : bgcolor, 
    borderRadius: 'inherit',
    width: `${fillAmount}%`, 
  };

  const textStyle = {
    padding: '10px',
    color: '#fff',
    fontWeight: 'bold',
  };

  return (
    <div style={parentStyle}>
      <div style={childStyle}>
        <span style={textStyle}>{`${fillAmount.toFixed(2)}%`}</span>
      </div>
    </div>
  );
};
