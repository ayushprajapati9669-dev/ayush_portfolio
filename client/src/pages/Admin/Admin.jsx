import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { TechLogo } from '../../components/common/TechLogos';
import { uploadImageViaCloudinary } from '../../services/api';
import { getDefaultPortfolioState } from '../../services/defaultPortfolioState';
import {
  validateProjectForm,
  validateCertificateForm,
  validatePasswordStrength
} from '../../utils/validation';

export function AdminPage() {
  const { appState, updateAppState, showToast, openConfirmModal } = usePortfolio();
  const { session, loginAdmin, logoutAdmin, resetAdminPassword, checkCurrentPassword } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('login');
  const [loginUser, setLoginUser] = useState('ayushprajapati9669@gmail.com');
  const [loginPass, setLoginPass] = useState('');
  const [authErrors, setAuthErrors] = useState({});

  const [forgotForm, setForgotForm] = useState({ email: '', phone: '', newPass: '', confirmPass: '' });
  const [activeTab, setActiveTab] = useState('dashboard');

  const [editingProjId, setEditingProjId] = useState(null);
  const [projForm, setProjForm] = useState({
    title: '',
    category: 'Full-Stack Web App',
    shortDescription: '',
    technologies: 'React JS, Node.js, Express.js, MongoDB',
    liveDemoUrl: '',
    githubUrl: 'https://github.com/ayushprajapati9669-dev',
    thumbnailUrl: '',
    featured: true
  });
  const [projErrors, setProjErrors] = useState({});

  const [editingCertId, setEditingCertId] = useState(null);
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    issueDate: '2025',
    credentialId: '',
    credentialUrl: '',
    skillsCovered: '',
    imageUrl: ''
  });
  const [certErrors, setCertErrors] = useState({});

  const [skillForm, setSkillForm] = useState({
    catId: appState.skills?.[0]?.id || 'skill-languages',
    name: '',
    logoKey: ''
  });
  const [skillError, setSkillError] = useState('');

  const [secForm, setSecForm] = useState({ curPass: '', newPass: '', confirmPass: '' });
  const [secErrors, setSecErrors] = useState({});

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginUser.trim()) errs.user = 'Admin email or username is required.';
    else if (loginUser.trim().length < 3) errs.user = 'Username must be at least 3 characters.';
    if (!loginPass) errs.pass = 'Password is required to sign in.';
    else if (loginPass.length < 6) errs.pass = 'Password must be at least 6 characters.';
    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs);
      return;
    }
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
    if (!email) errs.email = 'Registered email is required.';
    else if (email !== 'ayushprajapati9669@gmail.com') errs.email = 'Email does not match the registered admin email.';
    if (!phone) errs.phone = 'Registered phone number is required.';
    else if (!phone.endsWith('9669802554')) errs.phone = 'Phone number does not match registered admin phone.';
    if (!forgotForm.newPass) errs.newPass = 'New password is required.';
    else if (!validatePasswordStrength(forgotForm.newPass)) {
      errs.newPass = 'Password must be >= 8 chars with 1 uppercase, 1 digit, and 1 special char (e.g. @).';
    }
    if (!forgotForm.confirmPass) errs.confirmPass = 'Please confirm your new password.';
    else if (forgotForm.newPass !== forgotForm.confirmPass) errs.confirmPass = 'Passwords do not match.';

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs);
      return;
    }

    await resetAdminPassword(forgotForm.newPass);
    setForgotForm({ email: '', phone: '', newPass: '', confirmPass: '' });
    setAuthErrors({});
    setAuthMode('login');
    showToast('Password reset successfully! Please sign in with your new password.');
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 pt-14 pb-24">
        <div className="glass-card rounded-3xl p-7 sm:p-9 space-y-6 border border-cyanglow/30">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-vermilion/15 border border-vermilion/30 px-3 py-1 font-mono text-[10px] font-bold text-vermilion">
              <span>🔒 PROTECTED ADMIN PORTAL</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-alabaster">
              {authMode === 'forgot' ? 'Reset Admin Password' : 'Administrator Sign In'}
            </h1>
            <p className="text-xs leading-relaxed text-stonewarm">
              {authMode === 'forgot'
                ? 'Verify your registered email (ayushprajapati9669@gmail.com) and phone number (9669802554) to create a new admin password.'
                : 'Authorized access only. Sign in with your personal administrator credentials to manage projects, certificates, skills, and MongoDB/Cloudinary settings.'}
            </p>
          </div>

          {authErrors.banner && (
            <div className="rounded-xl border border-vermilion bg-vermilion/10 p-3.5 text-xs text-vermilion font-medium">
              {authErrors.banner}
            </div>
          )}

          {authMode === 'forgot' ? (
            <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Registered Admin Email *</label>
                <input
                  type="text"
                  value={forgotForm.email}
                  onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                  placeholder="ayushprajapati9669@gmail.com"
                  className="focus-ring w-full rounded-xl border border-white/15 bg-obsidian px-4 py-2.5 text-sm text-alabaster"
                />
                {authErrors.email && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {authErrors.email}</p>}
              </div>

              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Registered Phone Number (10 digits) *</label>
                <input
                  type="text"
                  value={forgotForm.phone}
                  onChange={(e) => setForgotForm({ ...forgotForm, phone: e.target.value })}
                  placeholder="9669802554"
                  className="focus-ring w-full rounded-xl border border-white/15 bg-obsidian px-4 py-2.5 text-sm text-alabaster"
                />
                {authErrors.phone && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {authErrors.phone}</p>}
              </div>

              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">New Password *</label>
                <input
                  type="password"
                  value={forgotForm.newPass}
                  onChange={(e) => setForgotForm({ ...forgotForm, newPass: e.target.value })}
                  placeholder="Min 8 chars, e.g. Ayush7162@"
                  className="focus-ring w-full rounded-xl border border-white/15 bg-obsidian px-4 py-2.5 text-sm text-alabaster"
                />
                {authErrors.newPass && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {authErrors.newPass}</p>}
              </div>

              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={forgotForm.confirmPass}
                  onChange={(e) => setForgotForm({ ...forgotForm, confirmPass: e.target.value })}
                  placeholder="Re-enter new password"
                  className="focus-ring w-full rounded-xl border border-white/15 bg-obsidian px-4 py-2.5 text-sm text-alabaster"
                />
                {authErrors.confirmPass && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {authErrors.confirmPass}</p>}
              </div>

              <button
                type="submit"
                className="focus-ring w-full rounded-full bg-cyanglow px-5 py-3 text-sm font-bold text-obsidian shadow-lg shadow-cyanglow/25"
              >
                Update & Reset Password
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthErrors({});
                  }}
                  className="font-mono text-xs text-stonewarm hover:text-alabaster underline"
                >
                  ← Back to Administrator Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Admin Email or Username *</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="ayushprajapati9669@gmail.com"
                  className="focus-ring w-full rounded-xl border border-white/15 bg-obsidian px-4 py-2.5 text-sm text-alabaster"
                />
                {authErrors.user && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {authErrors.user}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-mono text-xs text-stonewarm">Admin Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setAuthErrors({});
                    }}
                    className="font-mono text-[11px] text-cyanglow hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Enter your admin password"
                  className="focus-ring w-full rounded-xl border border-white/15 bg-obsidian px-4 py-2.5 text-sm text-alabaster"
                />
                {authErrors.pass && <p className="mt-1.5 font-mono text-[11px] text-vermilion">⚠ {authErrors.pass}</p>}
              </div>

              <button
                type="submit"
                className="focus-ring w-full rounded-full bg-vermilion px-5 py-3 text-sm font-bold text-obsidian shadow-lg shadow-vermilion/25 hover:opacity-95"
              >
                Sign In to Admin CMS →
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const publishedCount = (appState.projects || []).filter((p) => p.status === 'published').length;
  const certCount = (appState.certificates || []).length;
  const unreadMsgCount = (appState.messages || []).filter((m) => m.status === 'unread').length;

  const handleSaveProject = (e) => {
    e.preventDefault();
    const check = validateProjectForm(projForm);
    if (!check.isValid) {
      setProjErrors(check.errors);
      return;
    }
    const slug = projForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const technologies = projForm.technologies.split(',').map((s) => s.trim()).filter(Boolean);

    updateAppState((prev) => {
      if (editingProjId) {
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === editingProjId
              ? {
                  ...p,
                  title: projForm.title.trim(),
                  slug,
                  category: projForm.category.trim(),
                  shortDescription: projForm.shortDescription.trim(),
                  technologies,
                  thumbnailType: 'image',
                  thumbnailUrl: projForm.thumbnailUrl.trim(),
                  liveDemoUrl: projForm.liveDemoUrl.trim(),
                  githubUrl: projForm.githubUrl.trim(),
                  featured: Boolean(projForm.featured),
                  status: 'published',
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        };
      }
      return {
        ...prev,
        projects: [
          ...prev.projects,
          {
            id: 'proj-' + Date.now(),
            title: projForm.title.trim(),
            slug,
            category: projForm.category.trim(),
            shortDescription: projForm.shortDescription.trim(),
            technologies,
            thumbnailType: 'image',
            thumbnailUrl: projForm.thumbnailUrl.trim(),
            githubUrl: projForm.githubUrl.trim(),
            liveDemoUrl: projForm.liveDemoUrl.trim(),
            featured: Boolean(projForm.featured),
            status: 'published',
            displayOrder: prev.projects.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    }, session.token);

    showToast(editingProjId ? `Updated "${projForm.title}" in MongoDB.` : `Created "${projForm.title}" in MongoDB.`);
    setEditingProjId(null);
    setProjForm({
      title: '',
      category: 'Full-Stack Web App',
      shortDescription: '',
      technologies: 'React JS, Node.js, Express.js, MongoDB',
      liveDemoUrl: '',
      githubUrl: 'https://github.com/ayushprajapati9669-dev',
      thumbnailUrl: '',
      featured: true
    });
    setProjErrors({});
  };

  const handleSaveCertificate = (e) => {
    e.preventDefault();
    const check = validateCertificateForm(certForm);
    if (!check.isValid) {
      setCertErrors(check.errors);
      return;
    }

    updateAppState((prev) => {
      const certs = prev.certificates || [];
      if (editingCertId) {
        return {
          ...prev,
          certificates: certs.map((c) => (c.id === editingCertId ? { ...c, ...certForm } : c))
        };
      }
      return {
        ...prev,
        certificates: [{ id: 'cert-' + Date.now(), ...certForm }, ...certs]
      };
    }, session.token);

    showToast(editingCertId ? `Updated certificate "${certForm.title}".` : `Published certificate "${certForm.title}".`);
    setEditingCertId(null);
    setCertForm({
      title: '',
      issuer: '',
      issueDate: '2025',
      credentialId: '',
      credentialUrl: '',
      skillsCovered: '',
      imageUrl: ''
    });
    setCertErrors({});
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      setSkillError('Skill name is required.');
      return;
    }
    const name = skillForm.name.trim();
    const logoKey = (skillForm.logoKey.trim() || name).toLowerCase();
    updateAppState((prev) => ({
      ...prev,
      skills: prev.skills.map((cat) =>
        cat.id === skillForm.catId ? { ...cat, items: [...(cat.items || []), { name, logoKey }] } : cat
      )
    }), session.token);
    setSkillForm({ ...skillForm, name: '', logoKey: '' });
    setSkillError('');
    showToast(`Added "${name}" to skills.`);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!secForm.curPass) {
      errs.curPass = 'Current password is required.';
    } else {
      const ok = await checkCurrentPassword(secForm.curPass);
      if (!ok) errs.curPass = 'Current password is incorrect.';
    }
    if (!secForm.newPass) {
      errs.newPass = 'New password is required.';
    } else if (!validatePasswordStrength(secForm.newPass)) {
      errs.newPass = 'Must be >= 8 chars and include uppercase, number & special symbol (@, #, etc.).';
    }
    if (!secForm.confirmPass) {
      errs.confirmPass = 'Please confirm your new password.';
    } else if (secForm.newPass !== secForm.confirmPass) {
      errs.confirmPass = 'Confirmation password does not match new password.';
    }
    if (Object.keys(errs).length > 0) {
      setSecErrors(errs);
      return;
    }
    await resetAdminPassword(secForm.newPass);
    setSecForm({ curPass: '', newPass: '', confirmPass: '' });
    setSecErrors({});
    showToast('Admin password updated and saved permanently!');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b hairline-border pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sage">
            ● AUTHENTICATED ADMIN · MONGODB + CLOUDINARY PERSISTENCE ACTIVE
          </p>
          <h1 className="font-display text-3xl font-extrabold text-alabaster">Portfolio Admin CMS</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="focus-ring rounded-full border border-white/15 bg-charcoal px-4 py-2 font-mono text-xs text-alabaster hover:border-vermilion"
          >
            View Live Portfolio ↗
          </button>
          <button
            type="button"
            onClick={logoutAdmin}
            className="focus-ring rounded-full border border-vermilion/40 bg-obsidian px-4 py-2 font-mono text-xs text-vermilion hover:bg-vermilion hover:text-obsidian"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b hairline-border pb-4">
        {[
          { id: 'dashboard', label: 'Overview' },
          { id: 'projects', label: `Projects (${publishedCount})` },
          { id: 'certificates', label: `Certificates (${certCount})` },
          { id: 'skills', label: `Skills (${(appState.skills || []).length} Tabs)` },
          { id: 'profile', label: 'Profile & Resume' },
          { id: 'media', label: 'Hero Portrait' },
          { id: 'messages', label: `Messages (${unreadMsgCount})` },
          { id: 'security', label: 'Password & Database' }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`focus-ring rounded-full px-4 py-2 font-mono text-xs transition-colors ${
              activeTab === t.id
                ? 'bg-vermilion text-obsidian font-bold'
                : 'border border-white/10 bg-charcoal text-stonewarm hover:text-alabaster'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-2xl p-5">
              <p className="font-mono text-xs text-stonewarm">LIVE PROJECTS</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-sage">{publishedCount}</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="font-mono text-xs text-stonewarm">CERTIFICATES</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-cyanglow">{certCount}</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="font-mono text-xs text-stonewarm">MESSAGES</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-vermilion">
                {(appState.messages || []).length} ({unreadMsgCount} new)
              </p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="font-mono text-xs text-stonewarm">STORAGE ENGINE</p>
              <p className="mt-2 font-display text-xl font-extrabold text-alabaster">MongoDB + Cloudinary</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className="glass-card glass-card-hover rounded-2xl p-6 text-left space-y-2"
            >
              <span className="font-mono text-xs text-vermilion font-bold">01 · MANAGE PROJECTS</span>
              <h3 className="font-display text-lg font-bold text-white">Add / Edit Projects & Upload Images</h3>
              <p className="text-xs text-stonewarm">Upload project screenshots via Cloudinary and set Live Demo & GitHub URLs.</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className="glass-card glass-card-hover rounded-2xl p-6 text-left space-y-2"
            >
              <span className="font-mono text-xs text-cyanglow font-bold">02 · MANAGE CERTIFICATES</span>
              <h3 className="font-display text-lg font-bold text-white">Upload & Verify Certificates</h3>
              <p className="text-xs text-stonewarm">Add new certificate photos that open in the full-screen interactive certificate viewer.</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className="glass-card glass-card-hover rounded-2xl p-6 text-left space-y-2"
            >
              <span className="font-mono text-xs text-sage font-bold">03 · SECURITY & CLOUDINARY</span>
              <h3 className="font-display text-lg font-bold text-white">Update Password & DB Config</h3>
              <p className="text-xs text-stonewarm">Change your admin password and configure MongoDB & Cloudinary keys.</p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-8">
          <form onSubmit={handleSaveProject} noValidate className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-alabaster">
                {editingProjId ? 'Edit Project' : 'Create New Live Project'}
              </h2>
              {editingProjId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProjId(null);
                    setProjErrors({});
                  }}
                  className="font-mono text-xs text-stonewarm hover:text-alabaster"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Project Title *</label>
                <input
                  type="text"
                  value={projForm.title}
                  onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                  placeholder="e.g. Airbnb Clone — Vacation Rental Platform"
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                />
                {projErrors.title && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {projErrors.title}</p>}
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Category *</label>
                <input
                  type="text"
                  value={projForm.category}
                  onChange={(e) => setProjForm({ ...projForm, category: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                />
                {projErrors.category && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {projErrors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Project Description *</label>
              <textarea
                rows="2"
                value={projForm.shortDescription}
                onChange={(e) => setProjForm({ ...projForm, shortDescription: e.target.value })}
                placeholder="Describe what this project does..."
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
              />
              {projErrors.shortDescription && (
                <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {projErrors.shortDescription}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Technologies (comma-separated) *</label>
                <input
                  type="text"
                  value={projForm.technologies}
                  onChange={(e) => setProjForm({ ...projForm, technologies: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                />
                {projErrors.technologies && (
                  <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {projErrors.technologies}</p>
                )}
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Live Demo URL *</label>
                <input
                  type="text"
                  value={projForm.liveDemoUrl}
                  onChange={(e) => setProjForm({ ...projForm, liveDemoUrl: e.target.value })}
                  placeholder="https://airbnbclone2-8519.onrender.com"
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                />
                {projErrors.liveDemoUrl && (
                  <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {projErrors.liveDemoUrl}</p>
                )}
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">GitHub Code URL *</label>
                <input
                  type="text"
                  value={projForm.githubUrl}
                  onChange={(e) => setProjForm({ ...projForm, githubUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                />
                {projErrors.githubUrl && (
                  <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {projErrors.githubUrl}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-center rounded-2xl border border-white/10 bg-obsidian p-4">
              <div className="sm:col-span-8 space-y-2">
                <label className="block font-mono text-xs text-cyanglow font-bold">
                  Project Cover Image (Upload via Cloudinary / Local File) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    showToast('Uploading project image via Cloudinary...');
                    const url = await uploadImageViaCloudinary(file, appState.settings);
                    if (url) {
                      setProjForm((prev) => ({ ...prev, thumbnailUrl: url }));
                      showToast('Project image uploaded and ready!');
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-charcoal px-3.5 py-2 text-xs text-alabaster"
                />
                <input
                  type="text"
                  value={projForm.thumbnailUrl}
                  onChange={(e) => setProjForm({ ...projForm, thumbnailUrl: e.target.value })}
                  placeholder="Or paste Cloudinary / direct image URL (https://...)"
                  className="w-full rounded-xl border border-white/15 bg-charcoal px-3.5 py-2 text-xs text-alabaster"
                />
                {projErrors.thumbnailUrl && (
                  <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {projErrors.thumbnailUrl}</p>
                )}
              </div>
              <div className="sm:col-span-4 flex flex-col items-center justify-center">
                {projForm.thumbnailUrl ? (
                  <img
                    src={projForm.thumbnailUrl}
                    alt="Project Preview"
                    className="h-28 w-full object-cover rounded-xl border border-cyanglow/30"
                  />
                ) : (
                  <div className="h-28 w-full rounded-xl border border-dashed border-white/20 flex items-center justify-center font-mono text-[11px] text-stonewarm">
                    No image selected
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="inline-flex items-center gap-2 text-xs text-alabaster">
                <input
                  type="checkbox"
                  checked={projForm.featured}
                  onChange={(e) => setProjForm({ ...projForm, featured: e.target.checked })}
                />
                <span>Feature on Home Page</span>
              </label>
              <button
                type="submit"
                className="focus-ring rounded-full bg-vermilion px-6 py-2.5 text-xs font-bold text-obsidian shadow-lg shadow-vermilion/20"
              >
                {editingProjId ? 'Update Project in MongoDB' : '+ Save & Publish Project'}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {(appState.projects || []).map((proj) => (
              <div key={proj.id} className="glass-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {proj.thumbnailUrl && (
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.title}
                      className="h-16 w-24 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-display text-lg font-bold text-alabaster">{proj.title}</h3>
                    <p className="font-mono text-xs text-cyanglow mt-0.5">Live URL: {proj.liveDemoUrl}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProjId(proj.id);
                      setProjForm({
                        title: proj.title,
                        category: proj.category,
                        shortDescription: proj.shortDescription,
                        technologies: (proj.technologies || []).join(', '),
                        liveDemoUrl: proj.liveDemoUrl || '',
                        githubUrl: proj.githubUrl || '',
                        thumbnailUrl: proj.thumbnailUrl || '',
                        featured: Boolean(proj.featured)
                      });
                    }}
                    className="rounded-full border border-white/15 px-4 py-1.5 font-mono text-xs text-alabaster hover:border-cyanglow"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openConfirmModal(
                        `Delete "${proj.title}"?`,
                        'This project will be permanently removed from MongoDB.',
                        () => {
                          updateAppState((prev) => ({
                            ...prev,
                            projects: prev.projects.filter((p) => p.id !== proj.id)
                          }), session.token);
                          showToast('Project deleted.');
                        }
                      )
                    }
                    className="rounded-full border border-vermilion/40 px-4 py-1.5 font-mono text-xs text-vermilion"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-8">
          <form onSubmit={handleSaveCertificate} noValidate className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-alabaster">
              {editingCertId ? 'Edit Certificate' : 'Upload New Certificate to Cloudinary / MongoDB'}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Certificate Title *</label>
                <input
                  type="text"
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  placeholder="e.g. Delta (Full Stack Web Development)"
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
                />
                {certErrors.title && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {certErrors.title}</p>}
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Issuing Organization *</label>
                <input
                  type="text"
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  placeholder="e.g. Apna College"
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
                />
                {certErrors.issuer && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {certErrors.issuer}</p>}
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Issue Date / Year *</label>
                <input
                  type="text"
                  value={certForm.issueDate}
                  onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                  placeholder="e.g. 2025"
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
                />
                {certErrors.issueDate && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {certErrors.issueDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Credential ID</label>
                <input
                  type="text"
                  value={certForm.credentialId}
                  onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Credential Verify URL (Optional)</label>
                <input
                  type="text"
                  value={certForm.credentialUrl}
                  onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-cyanglow font-bold mb-1">Upload Certificate Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImageViaCloudinary(file, appState.settings);
                    if (url) {
                      setCertForm((prev) => ({ ...prev, imageUrl: url }));
                      showToast('Certificate image uploaded and ready!');
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-1.5 text-xs text-alabaster"
                />
                {certErrors.imageUrl && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {certErrors.imageUrl}</p>}
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Skills Covered</label>
              <input
                type="text"
                value={certForm.skillsCovered}
                onChange={(e) => setCertForm({ ...certForm, skillsCovered: e.target.value })}
                placeholder="HTML, CSS, JavaScript, React.js, Node.js, MongoDB..."
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
              />
            </div>

            <button type="submit" className="focus-ring rounded-full bg-cyanglow px-6 py-2.5 text-xs font-bold text-obsidian">
              {editingCertId ? 'Update Certificate' : '+ Save & Publish Certificate'}
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(appState.certificates || []).map((cert) => (
              <div key={cert.id} className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {cert.imageUrl && (
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      className="h-14 w-20 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-cyanglow truncate">{cert.issuer} · {cert.issueDate}</p>
                    <h3 className="font-display text-base font-bold text-white truncate">{cert.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCertId(cert.id);
                      setCertForm({
                        title: cert.title,
                        issuer: cert.issuer,
                        issueDate: cert.issueDate || '2025',
                        credentialId: cert.credentialId || '',
                        credentialUrl: cert.credentialUrl || '',
                        skillsCovered: cert.skillsCovered || '',
                        imageUrl: cert.imageUrl || ''
                      });
                    }}
                    className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-alabaster hover:border-cyanglow"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openConfirmModal('Delete Certificate?', 'This certificate will be permanently removed from MongoDB.', () => {
                        updateAppState((prev) => ({
                          ...prev,
                          certificates: (prev.certificates || []).filter((c) => c.id !== cert.id)
                        }), session.token);
                        showToast('Certificate deleted.');
                      })
                    }
                    className="rounded-full border border-vermilion/40 px-3 py-1 font-mono text-xs text-vermilion"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-6">
          <form onSubmit={handleAddSkill} noValidate className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-alabaster">Add Skill to Interactive Tabs</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Tab Category</label>
                <select
                  value={skillForm.catId}
                  onChange={(e) => setSkillForm({ ...skillForm, catId: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                >
                  {(appState.skills || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Skill Name *</label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="e.g. TypeScript"
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                />
                {skillError && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {skillError}</p>}
              </div>
              <div>
                <label className="block font-mono text-xs text-stonewarm mb-1">Icon Key</label>
                <input
                  type="text"
                  value={skillForm.logoKey}
                  onChange={(e) => setSkillForm({ ...skillForm, logoKey: e.target.value })}
                  placeholder="react, vite, css, tailwind, etc."
                  className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
                />
              </div>
            </div>
            <button type="submit" className="focus-ring rounded-full bg-cyanglow px-5 py-2.5 text-xs font-bold text-obsidian">
              + Add Skill Card
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(appState.skills || []).map((cat) => (
              <div key={cat.id} className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-alabaster">{cat.category}</h3>
                  <span className="font-mono text-xs text-cyanglow">{(cat.items || []).length} skills</span>
                </div>
                <div className="space-y-2">
                  {(cat.items || []).map((item, idx) => (
                    <div key={`${item.name}-${idx}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-obsidian px-3.5 py-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <TechLogo name={item.logoKey || item.name} className="h-4 w-4" />
                        <span className="font-semibold text-alabaster">{item.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateAppState((prev) => ({
                            ...prev,
                            skills: prev.skills.map((c) =>
                              c.id === cat.id ? { ...c, items: c.items.filter((_, i) => i !== idx) } : c
                            )
                          }), session.token);
                          showToast('Skill removed.');
                        }}
                        className="font-mono text-[11px] text-vermilion hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showToast('Profile & Resume saved to MongoDB.');
          }}
          className="glass-card rounded-3xl p-6 sm:p-8 space-y-5"
        >
          <h2 className="font-display text-xl font-bold text-alabaster">Edit Profile, Contact Info & Resume PDF</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Full Name *</label>
              <input
                type="text"
                value={appState.profile?.name || ''}
                onChange={(e) =>
                  updateAppState((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value }
                  }), session.token)
                }
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Navbar Brand Title</label>
              <input
                type="text"
                value={appState.profile?.displayName || ''}
                onChange={(e) =>
                  updateAppState((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, displayName: e.target.value }
                  }), session.token)
                }
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Navbar Subtitle</label>
              <input
                type="text"
                value={appState.profile?.headerSubtitle || ''}
                onChange={(e) =>
                  updateAppState((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, headerSubtitle: e.target.value }
                  }), session.token)
                }
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
              />
            </div>
          </div>

          <button type="submit" className="focus-ring rounded-full bg-vermilion px-6 py-3 text-xs font-bold text-obsidian">
            Save Profile & Resume Settings
          </button>
        </form>
      )}

      {activeTab === 'media' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 space-y-5">
            <h2 className="font-display text-xl font-bold text-alabaster">Hero Portrait Manager</h2>
            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1.5">Upload New Hero Photo (Cloudinary)</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImageViaCloudinary(file, appState.settings);
                  if (url) {
                    updateAppState((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        portrait: { ...prev.profile.portrait, url }
                      }
                    }), session.token);
                    showToast('Hero portrait uploaded via Cloudinary & saved.');
                  }
                }}
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-xs text-alabaster"
              />
            </div>
          </div>
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 flex flex-col items-center justify-center space-y-3">
            <p className="font-mono text-xs uppercase tracking-widest text-vermilion">CURRENT HERO PORTRAIT</p>
            <div className="h-72 w-full rounded-2xl border border-white/10 bg-obsidian overflow-hidden">
              <img
                src={appState.profile?.portrait?.url || '/images/ayush-hero-portrait.jpg'}
                alt={appState.profile?.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-alabaster">
            Received Contact Messages ({(appState.messages || []).length})
          </h2>
          {(appState.messages || []).map((msg) => (
            <div key={msg.id} className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-alabaster">{msg.subject}</h3>
                <span className="font-mono text-xs text-stonewarm">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="font-mono text-xs text-amberwarm">From: {msg.name} &lt;{msg.email}&gt;</p>
              <p className="text-sm leading-relaxed text-alabaster">{msg.message}</p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    openConfirmModal('Delete Message?', 'This message will be permanently removed.', () => {
                      updateAppState((prev) => ({
                        ...prev,
                        messages: prev.messages.filter((m) => m.id !== msg.id)
                      }), session.token);
                      showToast('Message deleted.');
                    })
                  }
                  className="rounded-full border border-vermilion/40 px-3.5 py-1 font-mono text-xs text-vermilion"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <form onSubmit={handleUpdatePassword} noValidate className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-vermilion">ADMIN SECURITY & AUTHORIZATION</p>
            <h2 className="font-display text-xl font-bold text-alabaster">Update Admin Password</h2>

            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Current Password *</label>
              <input
                type="password"
                value={secForm.curPass}
                onChange={(e) => setSecForm({ ...secForm, curPass: e.target.value })}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
              />
              {secErrors.curPass && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {secErrors.curPass}</p>}
            </div>

            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">New Password *</label>
              <input
                type="password"
                value={secForm.newPass}
                onChange={(e) => setSecForm({ ...secForm, newPass: e.target.value })}
                placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 special char"
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
              />
              {secErrors.newPass && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {secErrors.newPass}</p>}
            </div>

            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={secForm.confirmPass}
                onChange={(e) => setSecForm({ ...secForm, confirmPass: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2.5 text-sm text-alabaster"
              />
              {secErrors.confirmPass && <p className="mt-1 font-mono text-[11px] text-vermilion">⚠ {secErrors.confirmPass}</p>}
            </div>

            <button type="submit" className="focus-ring rounded-full bg-cyanglow px-6 py-2.5 text-xs font-bold text-obsidian">
              Update Admin Password
            </button>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast('MongoDB & Cloudinary configuration saved.');
            }}
            className="glass-card rounded-3xl p-6 sm:p-8 space-y-4"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-sage">DATABASE & CLOUD MEDIA</p>
            <h2 className="font-display text-xl font-bold text-alabaster">MongoDB & Cloudinary Settings</h2>

            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">Site Title</label>
              <input
                type="text"
                value={appState.settings?.siteTitle || ''}
                onChange={(e) =>
                  updateAppState((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, siteTitle: e.target.value }
                  }), session.token)
                }
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-stonewarm mb-1">MongoDB Connection URI</label>
              <input
                type="text"
                value={appState.settings?.mongodbUri || 'mongodb://127.0.0.1:27017/ayush_portfolio'}
                onChange={(e) =>
                  updateAppState((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, mongodbUri: e.target.value }
                  }), session.token)
                }
                className="w-full rounded-xl border border-white/15 bg-obsidian px-3.5 py-2 text-sm text-alabaster"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="submit" className="focus-ring rounded-full bg-vermilion px-6 py-2.5 text-xs font-bold text-obsidian">
                Save Database & Site Settings
              </button>
              <button
                type="button"
                onClick={() =>
                  openConfirmModal(
                    'Reset Portfolio Content?',
                    'All custom edits will be restored to the default portfolio state while keeping your admin password.',
                    () => {
                      updateAppState((prev) => ({
                        ...getDefaultPortfolioState(),
                        adminConfig: prev.adminConfig
                      }), session.token);
                      showToast('Portfolio restored to default state.');
                    }
                  )
                }
                className="focus-ring rounded-full border border-white/15 bg-obsidian px-4 py-2.5 font-mono text-xs text-stonewarm hover:text-alabaster"
              >
                Reset Default Data
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
