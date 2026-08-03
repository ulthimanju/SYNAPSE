import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSession } from '../features/auth/hooks/useSession';
import { useLogout } from '../features/auth/hooks/useLogout';
import { LayoutGrid, Folder, LogOut } from 'lucide-react';

export const MainLayout = () => {
  const { user } = useSession();
  const { mutate: logout } = useLogout();
  const location = useLocation();

  // Extract user initials
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'MU';

  return (
    <div className="min-h-screen flex bg-[#f4f5fa] text-slate-800 font-sans antialiased">
      {/* Icon Rail Left Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-20 bg-[#1c3d98] flex flex-col items-center justify-between py-6 flex-shrink-0 shadow-xl z-30">
        {/* Top Logo Badge */}
        <div className="space-y-8 flex flex-col items-center">
          <Link
            to="/workspaces"
            className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-400/40 text-white font-mono font-bold text-lg flex items-center justify-center shadow-lg hover:scale-105 transition"
            title="SYNAPSE v2"
          >
            S
          </Link>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-4">
            {/* Workspace Grid / Home */}
            <Link
              to="/workspaces"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                location.pathname === '/workspaces' && !location.search.includes('workspace=')
                  ? 'bg-white/10 text-white border border-white/20 shadow-inner'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              }`}
              title="All Workspaces"
            >
              <LayoutGrid className="w-5 h-5" />
            </Link>

            {/* Active Workspace */}
            <Link
              to={location.search.includes('workspace=') ? `/workspaces${location.search}` : '/workspaces'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                location.search.includes('workspace=')
                  ? 'bg-white/15 text-white border border-white/20 shadow-inner'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              }`}
              title="Active Workspace"
            >
              <Folder className="w-5 h-5" />
            </Link>
          </nav>

        </div>

        {/* Bottom User Avatar & Logout */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl text-blue-200/60 hover:text-rose-300 hover:bg-white/10 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>

          {/* Cyan User Initials Avatar */}
          <div
            className="w-10 h-10 rounded-full bg-[#67e8f9] text-[#1c3d98] font-extrabold text-xs flex items-center justify-center shadow-md select-none"
            title={user?.email || 'User Profile'}
          >
            {initials}
          </div>
        </div>
      </aside>

      {/* Main Viewport Container — offset by fixed sidebar width (w-20 = 80px) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f4f5fa] ml-20">
        <Outlet />
      </main>
    </div>
  );
};
