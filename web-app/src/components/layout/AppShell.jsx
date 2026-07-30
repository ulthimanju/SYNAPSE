import React from 'react';
import { SideNavigation } from './SideNavigation';
import { TopBar } from './TopBar';

export const AppShell = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
      <SideNavigation />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, padding: '0.75rem 2rem 2rem 2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
