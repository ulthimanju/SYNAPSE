import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export const OptionList = ({ options = [], selectedOption, onSelect, disabled = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.25rem 0' }}>
      {options.map((option, idx) => {
        const isSelected = selectedOption === option;
        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '1rem 1.25rem',
              textAlign: 'left',
              borderRadius: 'var(--radius-md)',
              border: isSelected ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)',
              backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
          >
            {isSelected ? (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-amber-hover)', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: isSelected ? 600 : 400 }}>{option}</span>
          </button>
        );
      })}
    </div>
  );
};
