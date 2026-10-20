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

export function AdminSecurity({
  checkCurrentPassword,
  resetAdminPassword,
  showToast
}) {
  const [form, setForm] = useState({
    curPass: '',
    newPass: '',
    confirmPass: ''
  });
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.curPass) {
      errs.curPass = 'Current password is required.';
    } else {
      const ok = await checkCurrentPassword(form.curPass);
      if (!ok) {
        errs.curPass = 'Current password is incorrect.';
      }
    }

    if (!form.newPass) {
      errs.newPass = 'New password is required.';
    } else if (!validatePasswordStrength(form.newPass)) {
      errs.newPass = 'Must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special symbol (e.g. @).';
    }

    if (!form.confirmPass) {
      errs.confirmPass = 'Please confirm your new password.';
    } else if (form.newPass !== form.confirmPass) {
      errs.confirmPass = 'Confirmation password does not match new password.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsUpdating(true);
    playTick();
    await resetAdminPassword(form.newPass);
    setIsUpdating(false);

    setForm({ curPass: '', newPass: '', confirmPass: '' });
    setErrors({});
    showToast('Admin password updated and saved permanently!', 'fa-lock');
  };

  return (
    <div className="space-y-8">
      <div className="glass-card-admin p-6 sm:p-8 space-y-5 max-w-2xl">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-lock text-cyan-400" />
            <span>Admin Authentication & Security</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Update your master password used to authenticate into the portfolio CMS and protect your live content.
          </p>
        </div>

        <form onSubmit={handleUpdate} noValidate className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              value={form.curPass}
              onChange={(e) => setForm({ ...form, curPass: e.target.value })}
              placeholder="Enter current admin password"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.curPass} />
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              New Master Password *
            </label>
            <input
              type="password"
              value={form.newPass}
              onChange={(e) => setForm({ ...form, newPass: e.target.value })}
              placeholder="e.g. Ayush7162@ (min 8 chars, 1 uppercase, 1 number, 1 special)"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.newPass} />
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              value={form.confirmPass}
              onChange={(e) => setForm({ ...form, confirmPass: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.confirmPass} />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="btn-save px-6 py-2.5 text-xs font-bold"
          >
            {isUpdating ? 'Saving Password...' : 'Save New Master Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminSecurity;
