import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50">
      {/* Left Blueprint Grid Banner Panel */}
      <div className="relative w-full md:w-1/2 bg-[#1d3d9e] text-white p-8 md:p-14 flex flex-col justify-between overflow-hidden min-h-[400px] md:min-h-screen">
        {/* SVG Blueprint Grid Background Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Blueprint Curved Line Accents */}
        <svg
          className="absolute top-0 right-0 w-[600px] h-[600px] text-white/10 pointer-events-none transform translate-x-1/4 -translate-y-1/4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          viewBox="0 0 500 500"
        >
          <circle cx="250" cy="250" r="200" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="300" />
        </svg>

        {/* Top Logo Brand Header */}
        <div className="relative z-10">
          <span className="text-xl font-extrabold tracking-[0.25em] text-white font-sans">
            SYNAPSE
          </span>
        </div>

        {/* Middle Hero Headline & Subtitle */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto py-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] font-sans">
            Your knowledge,
            <br />
            <span className="text-blue-200">indexed and alive.</span>
          </h1>
          <p className="text-base md:text-lg text-blue-100/90 font-normal leading-relaxed max-w-lg">
            Neural workspaces, document embeddings, and a real-time RAG engine that actually remembers what you fed it.
          </p>
        </div>

        {/* Bottom Encryption Footer */}
        <div className="relative z-10 pt-8">
          <p className="text-xs font-mono tracking-wider text-blue-200/70 uppercase">
            © 2026 SYNAPSE — ALL WORKSPACES ENCRYPTED
          </p>
        </div>
      </div>

      {/* Right Content Panel (Login Form) */}
      <div className="w-full md:w-1/2 bg-[#f8fafc] flex items-center justify-center p-6 md:p-12">
        {children}
      </div>
    </div>
  );
};
