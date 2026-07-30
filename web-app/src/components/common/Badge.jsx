import React from 'react';

export const Badge = ({ children, variant = 'amber' }) => {
  return <span className="editorial-badge">{children}</span>;
};
