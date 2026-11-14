import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api';
import { playTick } from '../../../utils/audio';

export function AdminSiteSettings({
  appState,
  updateAppState,
  session,
  showToast
}) {
  const currentSettings = appState.settings || {};
  const currentProfile = appState.profile || {};

  const [form, setForm] = useState({
    siteTitle: currentSettings.siteTitle || 'Ayush Prajapati — Full-Stack Developer Portfolio',
    siteName: currentSettings.siteName || currentProfile.displayName || 'Ayush Prajapati',
    contactEmail: currentSettings.contactEmail || currentProfile.email || 'ayushprajapati9669@gmail.com',
    contactPhone: currentSettings.contactPhone || currentProfile.phone || '(+91) 9669802554',
    contactNote: currentSettings.contactNote || 'Messages submitted through the contact form are validated on the server and persisted directly to the portfolio database for review in the Admin CMS.',
    maintenanceMode: Boolean(currentSettings.maintenanceMode),
    copyrightText: currentSettings.copyrightText || `© ${new Date().getFullYear()} ${currentProfile.displayName || 'Ayush Prajapati'}. All rights reserved.`
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    setForm({
      siteTitle: currentSettings.siteTitle || 'Ayush Prajapati — Full-Stack Developer Portfolio',
      siteName: currentSettings.siteName || currentProfile.displayName || 'Ayush Prajapati',
      contactEmail: currentSettings.contactEmail || currentProfile.email || 'ayushprajapati9669@gmail.com',
      contactPhone: currentSettings.contactPhone || currentProfile.phone || '(+91) 9669802554',
      contactNote: currentSettings.contactNote || 'Messages submitted through the contact form are validated on the server and persisted directly to the portfolio database for review in the Admin CMS.',
      maintenanceMode: Boolean(currentSettings.maintenanceMode),
      copyrightText: currentSettings.copyrightText || `© ${new Date().getFullYear()} ${currentProfile.displayName || 'Ayush Prajapati'}. All rights reserved.`
    });
    setIsDirty(false);
  }, [currentSettings.updatedAt]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      setIsDirty(true);
      return next;
    });

    if (field === 'contactEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    playTick();

    if (!form.siteTitle.trim()) {
      showToast('Website title is required.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.contactEmail && !emailRegex.test(form.contactEmail)) {
      showToast('Please enter a valid public contact email address.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...currentSettings,
        siteTitle: form.siteTitle.trim(),
        siteName: form.siteName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        contactNote: form.contactNote.trim(),
        maintenanceMode: Boolean(form.maintenanceMode),
        copyrightText: form.copyrightText.trim()
      };

      const res = await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: payload
      });

      updateAppState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...(res.settings || payload)
        }
      }), session?.csrfToken || session?.token);

      setIsSaving(false);
      setIsDirty(false);
      showToast('Site settings updated and persisted successfully!', 'success');
    } catch (err) {
      setIsSaving(false);
      showToast(err.message || 'Failed to save site settings.', 'error');
    }
  };

  return (
    <div className="admin-site-settings-page space-y-6 animate-in fade-in duration-300">
      {/* Top Action Banner */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #dfb740)' }}>
            <i className="fa-solid fa-sliders" /> GENERAL SITE & SYSTEM CONFIGURATION
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Site & Communication Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage global website titles, public contact details, contact form directives, and maintenance mode.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-black/40">
            {isDirty ? (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-semibold">Unsaved Changes</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-check text-emerald-400" />
                <span className="text-emerald-400 font-semibold">All Changes Saved</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 font-mono text-xs px-4 py-1.5 rounded-xl font-semibold text-black bg-yellow-400 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Section 1: General Website Identity */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <i className="fa-solid fa-globe text-yellow-400 text-xs" />
                General Website Identity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configures primary site titles, browser tab labels, and footer brand signatures.
              </p>
            </div>

            {/* Site Title */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Default Browser Window Title</label>
              <input
                type="text"
                value={form.siteTitle}
                onChange={(e) => handleChange('siteTitle', e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white focus:border-yellow-400/50 outline-none"
                placeholder="Ayush Prajapati — Full-Stack Developer Portfolio"
              />
            </div>

            {/* Site Brand Name */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Site Brand Name / Monogram Tag</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white focus:border-yellow-400/50 outline-none"
                placeholder="Ayush Prajapati"
              />
            </div>

            {/* Copyright Notice */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Footer Copyright Text</label>
              <input
                type="text"
                value={form.copyrightText}
                onChange={(e) => handleChange('copyrightText', e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white focus:border-yellow-400/50 outline-none"
                placeholder="© 2026 Ayush Prajapati. All rights reserved."
              />
            </div>
          </div>

          {/* Section 2: Public Contact & Inquiries */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <i className="fa-solid fa-address-card text-yellow-400 text-xs" />
                Public Inquiries & Contact Directives
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sets public contact endpoints rendered in the contact page and luxury footer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Public Contact Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className={`w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border bg-black/50 text-white outline-none ${
                    emailError ? 'border-red-500/50' : 'border-white/10 focus:border-yellow-400/50'
                  }`}
                  placeholder="ayushprajapati9669@gmail.com"
                />
                {emailError && (
                  <p className="text-[11px] text-red-400 mt-1 font-mono">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Public Contact Phone</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white focus:border-yellow-400/50 outline-none"
                  placeholder="(+91) 9669802554"
                />
              </div>
            </div>

            {/* Contact Note */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Public Contact Form Note / Submission Policy
              </label>
              <textarea
                rows={3}
                value={form.contactNote}
                onChange={(e) => handleChange('contactNote', e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white focus:border-yellow-400/50 outline-none resize-none"
                placeholder="Important notice displayed to visitors before sending inquiries..."
                maxLength={600}
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Displayed in a highlight box directly above the Send Message form on /contact.
              </p>
            </div>
          </div>

          {/* Section 3: Maintenance Mode Configuration */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-amber-400 text-xs" />
                  Scheduled Maintenance Mode
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Displays an active system notification banner across public pages while keeping the admin CMS accessible.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.maintenanceMode}
                onClick={() => handleChange('maintenanceMode', !form.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.maintenanceMode ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    form.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {form.maintenanceMode && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 font-mono space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <i className="fa-solid fa-bell text-amber-400" />
                  Maintenance Mode is Currently Active
                </div>
                <div className="text-[11px] text-amber-200/80 leading-relaxed">
                  Visitors on public routes will see a luxury status banner notifying them that maintenance and benchmark updates are in progress. Admin login and editing remain fully functional.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Security Architecture & Information Summary (5 cols) */}
        <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-6">
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-yellow-400" />
                Security & Data Isolation Architecture
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Strict boundary enforcement between public settings and private server secrets.
              </p>
            </div>

            {/* Architecture Explainer */}
            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-lock text-[10px]" /> Private Server Secrets (Strictly Blocked)
                </div>
                <p className="text-[11px] text-slate-400">
                  MongoDB connection strings, JWT secrets, and scrypt password hashes are never exposed through public endpoints or frontend state.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-1">
                <div className="text-yellow-400 font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-bullhorn text-[10px]" /> Public Bootstrap Allowlist
                </div>
                <p className="text-[11px] text-slate-400">
                  Only explicitly whitelisted parameters (siteTitle, siteName, contactEmail, contactNote, theme colors, etc.) are delivered to the public web application.
                </p>
              </div>
            </div>

            {/* Summary Preview */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/60 space-y-2 text-xs font-mono">
              <div className="text-slate-400 text-[10px] uppercase">Current Config Snapshot</div>
              <div className="text-white truncate">Title: <span className="text-yellow-300">{form.siteTitle}</span></div>
              <div className="text-white truncate">Contact: <span className="text-yellow-300">{form.contactEmail}</span></div>
              <div className="text-white">
                Status:{' '}
                <span className={form.maintenanceMode ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {form.maintenanceMode ? 'Maintenance Active' : 'Normal Public Access'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-black bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    <span>Publishing to Database...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    <span>Publish Site Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSiteSettings;
