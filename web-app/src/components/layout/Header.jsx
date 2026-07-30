import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { Avatar } from '../common/Avatar';

export const Header = () => {
  return (
    <header style={{ height: '56px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Breadcrumb />
      <Avatar name="Synapse User" size="sm" />
    </header>
  );
};
