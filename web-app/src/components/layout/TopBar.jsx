import React from 'react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useAppStore } from '../../stores/appStore';
import { Menu } from 'lucide-react';

export const TopBar = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <header
      style={{
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <WorkspaceSwitcher />
      </div>
    </header>
  );
};
