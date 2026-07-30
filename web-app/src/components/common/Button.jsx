import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'font-sans font-medium rounded-md transition-all duration-150 inline-flex items-center justify-center gap-2 border';
  
  const variants = {
    primary: 'bg-[var(--accent-amber)] hover:bg-[var(--accent-amber-hover)] text-white border-transparent shadow-sm',
    secondary: 'bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]',
    outline: 'bg-transparent hover:bg-[var(--accent-light)] text-[var(--accent-amber)] border-[var(--accent-amber)]',
    ghost: 'bg-transparent hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-transparent',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
};
