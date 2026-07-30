import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useThemeStore } from '../../stores/themeStore';
import { LayoutDashboard, FolderKanban, Sun, Moon } from 'lucide-react';
import { UserMenu } from './UserMenu';

export const SideNavigation = () => {
  const location = useLocation();
  const { sidebarOpen, activeWorkspaceId } = useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  const workspacePath = activeWorkspaceId ? `/workspaces/${activeWorkspaceId}` : '/workspaces/ws-1';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Workspaces', path: workspacePath, icon: FolderKanban },
  ];

  if (!sidebarOpen) return null;

  return (
    <aside
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '240px',
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 95,
        overflowY: 'auto',
      }}
    >
      <div>
        <div style={{ padding: '0 0.5rem 1.5rem 0.5rem' }}>
          <h2 className="font-serif" style={{ fontSize: '1.25rem' }}>Synapse</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith('/workspaces')
              ? item.label === 'Workspaces'
              : location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: active ? 'var(--accent-amber-hover)' : 'var(--text-secondary)',
                  backgroundColor: active ? 'var(--accent-light)' : 'transparent',
                  border: active ? '1px solid var(--accent-amber)' : '1px solid transparent',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar Bottom: User Profile & Theme Toggle */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <UserMenu direction="up" />
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            padding: '0.4rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-card)',
          }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </aside>
  );
};
