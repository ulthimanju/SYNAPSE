import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSession } from '../features/auth/hooks/useSession';
import { useLogout } from '../features/auth/hooks/useLogout';
import { useUIStore } from '../store/uiStore';
import { LogOut, Sun, Moon, LayoutDashboard, FolderGit2, Sparkles, UserCheck } from 'lucide-react';

export const MainLayout = () => {
  const { user } = useSession();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blueprint-600 flex items-center justify-center shadow-lg shadow-blueprint-500/30">
              <span className="font-mono font-bold text-white text-base">S</span>
            </div>
            <div>
              <h1 className="font-bold text-base tracking-widest text-white font-sans">SYNAPSE</h1>
              <p className="text-[10px] font-mono text-blueprint-400">v2.0 OS ENGINE</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-blueprint-400 font-medium text-sm border border-slate-800"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Workspaces</span>
            </Link>
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blueprint-900 border border-blueprint-500/40 flex items-center justify-center text-xs font-bold text-blueprint-200">
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
