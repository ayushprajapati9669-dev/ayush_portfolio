import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { playTick } from '../../../utils/audio';

function FormErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-300">
      <svg className="h-3.5 w-3.5 shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export function AdminAuthModal({
  loginAdmin,
  resetAdminPassword,
  showToast
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'forgot'
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authErrors, setAuthErrors] = useState({});

  const cardRef = useRef(null);

  // GSAP Entrance
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.98, y: 15 },
        { scale: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [authMode]);

  const shakeCard = () => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && cardRef.current) {
      gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginUser.trim()) {
      errs.user = 'Admin email or username is required.';
    } else if (loginUser.trim().length < 3) {
      errs.user = 'Username must be at least 3 characters.';
    }

    if (!loginPass) {
      errs.pass = 'Password is required to sign in.';
    } else if (loginPass.length < 6) {
      errs.pass = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs);
      shakeCard();
      return;
    }

    playTick();
    const res = await loginAdmin(loginUser, loginPass);
    if (!res.ok) {
      shakeCard();
      setAuthErrors({
        banner: res.lockoutError || 'Authentication failed: Invalid admin credentials.',
        user: res.userError || '',
        pass: res.passError || ''
      });
    } else {
      setAuthErrors({});
      setLoginPass('');
    }
  };

  return (
    <div className="admin-auth-content mx-auto max-w-md px-4">
      <div ref={cardRef} className="glass-card-admin rounded-3xl p-7 sm:p-9 space-y-6 border border-yellow-400/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 font-mono text-[10px] font-bold text-yellow-400">
            <i className="fa-solid fa-lock text-xs" />
            <span>PROTECTED ADMIN PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {authMode === 'forgot' ? 'Admin Credential Recovery' : 'Administrator Sign In'}
          </h1>
          <p className="text-xs leading-relaxed text-slate-400">
            {authMode === 'forgot'
              ? 'CLI-based master credential management and password reset procedure.'
              : 'Authorized access only. Sign in with your administrator credentials to manage portfolio content.'}
          </p>
        </div>

        {authErrors.banner && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 font-medium">
            {authErrors.banner}
          </div>
        )}

        {authMode === 'forgot' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-xs text-slate-300 space-y-3">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                <i className="fa-solid fa-terminal" />
                <span>Direct CLI Credential Recovery</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                For security isolation, administrator credential updates and password resets must be executed directly on the host server environment via the admin CLI utility:
              </p>
              <div className="rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-xs text-yellow-400 select-all">
                npm run setup:admin
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Run this command in the project terminal to securely reconfigure credentials or generate a new administrator session without exposing reset endpoints to the public web.
              </p>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setAuthMode('login');
                  setAuthErrors({});
                }}
                className="font-mono text-xs text-yellow-400 hover:underline inline-flex items-center gap-1.5"
              >
                ← Back to Administrator Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Admin Username or Email *
              </label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
              />
              <FormErrorMessage message={authErrors.user} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-xs text-slate-400">Admin Password *</label>
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setAuthMode('forgot');
                    setAuthErrors({});
                  }}
                  className="font-mono text-[11px] text-yellow-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
              />
              <FormErrorMessage message={authErrors.pass} />
            </div>

            <button
              type="submit"
              className="btn-save w-full py-3 text-sm font-bold"
            >
              Sign In to Admin CMS →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminAuthModal;
