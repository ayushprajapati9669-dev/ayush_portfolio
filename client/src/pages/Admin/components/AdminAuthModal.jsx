import React, { useState } from 'react';
import { validatePasswordStrength } from '../../../utils/validation';
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
  const [loginUser, setLoginUser] = useState('ayushprajapati9669@gmail.com');
  const [loginPass, setLoginPass] = useState('');
  const [authErrors, setAuthErrors] = useState({});

  const [forgotForm, setForgotForm] = useState({
    email: '',
    phone: '',
    newPass: '',
    confirmPass: ''
  });

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
      return;
    }

    playTick();
    const res = await loginAdmin(loginUser, loginPass);
    if (!res.ok) {
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const email = forgotForm.email.trim().toLowerCase();
    const phone = forgotForm.phone.replace(/[^0-9]/g, '');

    if (!email) {
      errs.email = 'Registered email is required.';
    } else if (email !== 'ayushprajapati9669@gmail.com') {
      errs.email = 'Email does not match the registered admin email.';
    }

    if (!phone) {
      errs.phone = 'Registered phone number is required.';
    } else if (!phone.endsWith('9669802554')) {
      errs.phone = 'Phone number does not match registered admin phone.';
    }

    if (!forgotForm.newPass) {
      errs.newPass = 'New password is required.';
    } else if (!validatePasswordStrength(forgotForm.newPass)) {
      errs.newPass = 'Password must be >= 8 chars with 1 uppercase, 1 digit, and 1 special char (e.g. @).';
    }

    if (!forgotForm.confirmPass) {
      errs.confirmPass = 'Please confirm your new password.';
    } else if (forgotForm.newPass !== forgotForm.confirmPass) {
      errs.confirmPass = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs);
      return;
    }

    playTick();
    await resetAdminPassword(forgotForm.newPass);
    setForgotForm({ email: '', phone: '', newPass: '', confirmPass: '' });
    setAuthErrors({});
    setAuthMode('login');
    showToast('Password reset successfully! Please sign in with your new password.', 'fa-lock');
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-32 pb-24">
      <div className="glass-card-admin rounded-3xl p-7 sm:p-9 space-y-6 border border-cyan-400/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 font-mono text-[10px] font-bold text-cyan-400">
            <i className="fa-solid fa-lock text-xs" />
            <span>PROTECTED ADMIN PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {authMode === 'forgot' ? 'Reset Admin Password' : 'Administrator Sign In'}
          </h1>
          <p className="text-xs leading-relaxed text-slate-400">
            {authMode === 'forgot'
              ? 'Verify your registered email and phone number to create a new master password.'
              : 'Authorized access only. Sign in with your administrator credentials to manage portfolio content.'}
          </p>
        </div>

        {authErrors.banner && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 font-medium">
            {authErrors.banner}
          </div>
        )}

        {authMode === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Registered Admin Email *
              </label>
              <input
                type="text"
                value={forgotForm.email}
                onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                placeholder="ayushprajapati9669@gmail.com"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
              {authErrors.email && <p className="mt-1 font-mono text-[11px] text-red-400">{authErrors.email}</p>}
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Registered Phone Number (10 digits) *
              </label>
              <input
                type="text"
                value={forgotForm.phone}
                onChange={(e) => setForgotForm({ ...forgotForm, phone: e.target.value })}
                placeholder="9669802554"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
              {authErrors.phone && <p className="mt-1 font-mono text-[11px] text-red-400">{authErrors.phone}</p>}
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                New Password *
              </label>
              <input
                type="password"
                value={forgotForm.newPass}
                onChange={(e) => setForgotForm({ ...forgotForm, newPass: e.target.value })}
                placeholder="Min 8 chars, e.g. Ayush7162@"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
              <FormErrorMessage message={authErrors.newPass} />
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={forgotForm.confirmPass}
                onChange={(e) => setForgotForm({ ...forgotForm, confirmPass: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
              <FormErrorMessage message={authErrors.confirmPass} />
            </div>

            <button
              type="submit"
              className="btn-save w-full py-3 text-sm font-bold"
            >
              Update & Reset Password
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setAuthMode('login');
                  setAuthErrors({});
                }}
                className="font-mono text-xs text-cyan-400 hover:underline"
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
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="ayushprajapati9669@gmail.com"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
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
                  className="font-mono text-[11px] text-cyan-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter your master password"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
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
