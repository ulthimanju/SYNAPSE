import React from 'react';
import { GoogleButton } from './GoogleButton';

export const LoginCard = ({ onGoogleLogin }) => {
  return (
    <div className="w-full max-w-md p-8 md:p-10 space-y-6">
      {/* Pill Badge */}
      <div>
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-semibold tracking-wider bg-sky-100 text-sky-700 uppercase">
          WELCOME BACK
        </span>
      </div>

      {/* Header & Subtitle */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Sign in to Synapse
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Access your workspaces and pick up right where you left off.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <GoogleButton onClick={onGoogleLogin} />
      </div>

      {/* Footer Legal Terms */}
      <p className="text-xs text-slate-500 text-left leading-relaxed pt-2">
        By signing in, you agree to Synapse's{' '}
        <a href="#terms" className="font-medium text-slate-700 underline underline-offset-2 hover:text-blueprint-600">
          terms of service
        </a>{' '}
        and{' '}
        <a href="#privacy" className="font-medium text-slate-700 underline underline-offset-2 hover:text-blueprint-600">
          privacy policy
        </a>
        .
      </p>
    </div>
  );
};
