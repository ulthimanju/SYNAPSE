import React from 'react';

export const LoadingScreen = ({ message = 'Initializing authentication session...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
      {/* Animated Synapse Pulse Logo */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-blueprint-500/30 animate-ping absolute"></div>
        <div className="w-12 h-12 rounded-2xl bg-blueprint-600 flex items-center justify-center shadow-lg shadow-blueprint-500/50">
          <span className="font-mono font-bold text-lg text-white">S</span>
        </div>
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-mono tracking-widest text-slate-300 uppercase">
          SYNAPSE OS
        </p>
        <p className="text-xs text-slate-400 font-sans">
          {message}
        </p>
      </div>
    </div>
  );
};
