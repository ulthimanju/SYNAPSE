import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { Sun, Moon } from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav style={{ height: '64px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
        Synapse
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/workspaces" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Workspaces</Link>
        <Link to="/dashboard" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Dashboard</Link>
        <Link to="/login" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent-amber)' }}>Sign In</Link>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
};
