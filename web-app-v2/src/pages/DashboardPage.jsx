import React from 'react';
import { useSession } from '../features/auth/hooks/useSession';
import { Sparkles, ShieldCheck, Database, KeyRound, Cpu, Layers } from 'lucide-react';

export const DashboardPage = () => {
  const { user, roles } = useSession();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blueprint-900 via-blueprint-800 to-slate-900 border border-blueprint-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blueprint-500/20 border border-blueprint-400/30 text-blueprint-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blueprint-400" />
            SYNAPSE v2.0 ARCHITECTURE ACTIVE
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome back, {user?.full_name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Your session is secured via <span className="text-blueprint-300 font-mono font-semibold">HttpOnly SameSite=Lax Cookies</span> with automatic Refresh Token Rotation and Redis-backed session verification.
          </p>
        </div>
      </div>

      {/* Security & Session Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blueprint-900/50 border border-blueprint-500/30 flex items-center justify-center text-blueprint-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Authenticated Session</h3>
              <p className="text-xs text-slate-400">Verified via /auth/session</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div><span className="text-slate-500">ID:</span> {user?.id}</div>
            <div><span className="text-slate-500">Email:</span> {user?.email}</div>
            <div><span className="text-slate-500">Role:</span> {roles.join(', ') || 'student'}</div>
          </div>
        </div>

        {/* HttpOnly Cookie Security Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">HttpOnly Security</h3>
              <p className="text-xs text-slate-400">Zero JS Access to Tokens</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div><span className="text-slate-500">Access Token:</span> 15m HttpOnly</div>
            <div><span className="text-slate-500">Refresh Token:</span> 30d Rotated</div>
            <div><span className="text-slate-500">CSRF Strategy:</span> SameSite=Lax</div>
          </div>
        </div>

        {/* Redis Caching Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Redis Multi-Layer Cache</h3>
              <p className="text-xs text-slate-400">Sub-Millisecond Verification</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div><span className="text-slate-500">Session Cache:</span> Active</div>
            <div><span className="text-slate-500">Profile Cache:</span> 15m TTL</div>
            <div><span className="text-slate-500">Vector Search:</span> pgvector</div>
          </div>
        </div>
      </div>
    </div>
  );
};
