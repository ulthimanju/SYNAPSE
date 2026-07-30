import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export const UserMenu = ({ direction = 'down' }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const displayName = user?.full_name || user?.email || 'Student User';
  const displayEmail = user?.email || 'student@synapse.ai';

  const isUp = direction === 'up';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderRadius: 'var(--radius-sm)',
        }}
        title={displayName}
      >
        <Avatar name={displayName} size="sm" />
        <div style={{ textAlign: 'left', overflow: 'hidden' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
            {displayName}
          </div>
        </div>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              ...(isUp ? { bottom: '100%', marginBottom: '0.5rem' } : { top: '100%', marginTop: '0.375rem' }),
              left: 0,
              width: '210px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 100,
              padding: '0.5rem',
            }}
          >
            <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</div>
            </div>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}
            >
              <User size={14} /> Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.5rem',
                fontSize: '0.875rem',
                color: '#DC2626',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
