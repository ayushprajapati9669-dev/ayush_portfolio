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
  recoverAdminPassword,
  showToast
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'forgot'
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authErrors, setAuthErrors] = useState({});
  const [resetSuccessBanner, setResetSuccessBanner] = useState('');

  // Recovery Form State
  const [recoveryUser, setRecoveryUser] = useState('ayushprajapati9669@gmail.com');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!recoveryUser.trim()) {
      errs.recoveryUser = 'Admin email or username is required.';
    }

    if (!recoveryKey.trim()) {
      errs.recoveryKey = 'Recovery mobile number or passkey is required.';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 10) {
      errs.newPassword = 'Password must be at least 10 characters long.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Confirmation password does not match.';
    }

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs);
      shakeCard();
      return;
    }

    setIsResetting(true);
    setAuthErrors({});
    playTick();

    if (typeof recoverAdminPassword !== 'function') {
      setIsResetting(false);
      setAuthErrors({ banner: 'Password recovery handler is unavailable. Please check server.' });
      shakeCard();
      return;
    }

    const res = await recoverAdminPassword({
      usernameOrEmail: recoveryUser.trim(),
      recoveryKey: recoveryKey.trim(),
      newPassword
    });

    setIsResetting(false);

    if (!res.ok) {
      shakeCard();
      setAuthErrors({
        banner: res.error || 'Failed to reset password. Please verify your credentials.'
      });
    } else {
      setLoginUser(recoveryUser.trim());
      setRecoveryKey('');
      setNewPassword('');
      setConfirmPassword('');
      setAuthMode('login');
      setResetSuccessBanner('Password reset successfully! Please sign in with your new password.');
      setAuthErrors({});
      if (typeof showToast === 'function') {
        showToast('Password reset successfully! You can now sign in.', 'fa-check');
      }
    }
  };

  return (
    <div className="admin-auth-content mx-auto max-w-md px-4">
      <div ref={cardRef} className="glass-card-admin rounded-3xl p-7 sm:p-9 space-y-6 border border-yellow-400/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 font-mono text-[10px] font-bold text-yellow-400">
            <i className={`fa-solid ${authMode === 'forgot' ? 'fa-key' : 'fa-lock'} text-xs`} />
            <span>{authMode === 'forgot' ? 'ADMIN CREDENTIAL RECOVERY' : 'PROTECTED ADMIN PORTAL'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {authMode === 'forgot' ? 'Reset Admin Password' : 'Administrator Sign In'}
          </h1>
          <p className="text-xs leading-relaxed text-slate-400">
            {authMode === 'forgot'
              ? 'Verify your registered recovery details to set a new administrator password.'
              : 'Authorized access only. Sign in with your administrator credentials to manage portfolio content.'}
          </p>
        </div>

        {resetSuccessBanner && authMode === 'login' && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 font-medium flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-emerald-400 text-sm shrink-0" />
            <span>{resetSuccessBanner}</span>
          </div>
        )}

        {authErrors.banner && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 font-medium flex items-start gap-2">
            <i className="fa-solid fa-triangle-exclamation text-red-400 text-sm shrink-0 mt-0.5" />
            <span>{authErrors.banner}</span>
          </div>
        )}

        {authMode === 'forgot' ? (
          <form onSubmit={handleRecoverySubmit} noValidate className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Admin Username or Email *
              </label>
              <input
                type="text"
                name="recoveryUser"
                autoComplete="username"
                value={recoveryUser}
                onChange={(e) => setRecoveryUser(e.target.value)}
                placeholder="ayushprajapati9669@gmail.com"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
              />
              <FormErrorMessage message={authErrors.recoveryUser} />
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Recovery Mobile Number / Passkey *
              </label>
              <input
                type="text"
                name="recoveryKey"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                placeholder="e.g. 9669802554 or Master Recovery Key"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Enter your registered mobile number or master recovery passkey.
              </p>
              <FormErrorMessage message={authErrors.recoveryKey} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-xs text-slate-400">New Password *</label>
                <button
                  type="button"
                  onClick={() => setShowResetPass((prev) => !prev)}
                  className="font-mono text-[11px] text-yellow-400/90 hover:text-yellow-300 transition-colors"
                >
                  {showResetPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showResetPass ? 'text' : 'password'}
                name="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 10 characters"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
              />
              <FormErrorMessage message={authErrors.newPassword} />
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Confirm New Password *
              </label>
              <input
                type={showResetPass ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
              />
              <FormErrorMessage message={authErrors.confirmPassword} />
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="btn-save w-full py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>Verifying & Resetting...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-shield-halved" />
                  <span>Reset Password & Sign In</span>
                </>
              )}
            </button>

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
          </form>
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
