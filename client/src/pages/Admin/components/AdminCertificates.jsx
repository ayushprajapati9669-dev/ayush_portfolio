import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { uploadImageViaCloudinary } from '../../../services/api';
import { validateCertificateForm, isValidUrl } from '../../../utils/validation';
import { playTick } from '../../../utils/audio';
import { usePortfolio } from '../../../app/providers/ThemeProvider';

const COMMON_ISSUERS = [
  'Apna College',
  'Meta',
  'Amazon Web Services',
  'Code With Harry',
  'HackerRank',
  'Google',
  'Coursera',
  'freeCodeCamp',
  'Udemy'
];

const COMMON_YEARS = ['2026', '2025', '2024', '2023', '2022'];

const COMMON_CATEGORIES = [
  'Full Stack Development',
  'Artificial Intelligence & ML',
  'Cloud Computing',
  'Frontend Engineering',
  'Backend & System Design',
  'Data Science & Analytics'
];

const RECOMMENDED_SKILLS = [
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'Python',
  'TensorFlow',
  'AWS',
  'Tailwind CSS',
  'Docker',
  'Git',
  'Next.js',
  'TypeScript',
  'REST APIs',
  'GraphQL',
  'Data Science',
  'UI/UX'
];

function FormErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-300">
      <svg className="h-3.5 w-3.5 shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export function AdminCertificates({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const { openCertificateLightbox } = usePortfolio();

  // Wizard Stage State (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHeadingsOpen, setIsHeadingsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    issuer: '',
    issueDate: '2025',
    category: 'Full Stack Development',
    featured: false,
    credentialId: '',
    credentialUrl: '',
    status: 'Verified',
    downloadUrl: '',
    skillsCovered: '',
    description: '',
    imageUrl: ''
  });

  // Skill Tags interactive array state
  const [skillTagInput, setSkillTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL, FEATURED, VERIFIED
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, title-asc, issuer-asc

  // 3D Tilt Card Ref for Step 4 Preview
  const previewCardRef = useRef(null);
  const formTopRef = useRef(null);

  const certificates = appState.certificates || [];

  // Parse skill tags from form.skillsCovered
  const currentSkillTags = useMemo(() => {
    if (!form.skillsCovered) return [];
    return form.skillsCovered
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [form.skillsCovered]);

  // Sync skill tags back to comma-separated string
  const updateSkillTags = (newTags) => {
    setForm((prev) => ({
      ...prev,
      skillsCovered: newTags.join(', ')
    }));
  };

  const handleAddSkillTag = (skillToAdd) => {
    const clean = (skillToAdd || skillTagInput).trim();
    if (!clean) return;
    playTick();
    if (!currentSkillTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      updateSkillTags([...currentSkillTags, clean]);
    }
    setSkillTagInput('');
  };

  const handleRemoveSkillTag = (tagToRemove) => {
    playTick();
    updateSkillTags(currentSkillTags.filter((t) => t !== tagToRemove));
  };

  const handleToggleRecommendedSkill = (skill) => {
    playTick();
    if (currentSkillTags.some((t) => t.toLowerCase() === skill.toLowerCase())) {
      handleRemoveSkillTag(skill);
    } else {
      handleAddSkillTag(skill);
    }
  };

  // Helper to auto-generate a credential ID
  const handleAutoGenerateId = () => {
    playTick();
    const prefix = form.issuer
      ? form.issuer.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()
      : 'CERT';
    const year = form.issueDate || '2025';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    setForm((prev) => ({
      ...prev,
      credentialId: `${prefix}-${year}-${rand}`
    }));
    showToast('Generated credential ID identifier.');
  };

  // Stage Step Validation
  const validateStep = (stepNumber) => {
    const errs = {};
    if (stepNumber === 1) {
      if (!form.title || form.title.trim().length < 3) {
        errs.title = 'Certificate title is required (minimum 3 characters).';
      }
      if (!form.issuer || !form.issuer.trim()) {
        errs.issuer = 'Issuing organization is required.';
      }
      if (!form.issueDate || !form.issueDate.trim()) {
        errs.issueDate = 'Issue year or date is required.';
      }
    } else if (stepNumber === 2) {
      if (form.credentialUrl && !isValidUrl(form.credentialUrl)) {
        errs.credentialUrl = 'Verification URL must begin with https:// or http://';
      }
      if (form.downloadUrl && !isValidUrl(form.downloadUrl)) {
        errs.downloadUrl = 'Download URL must begin with https:// or http://';
      }
    } else if (stepNumber === 4) {
      if (!form.imageUrl || !form.imageUrl.trim()) {
        errs.imageUrl = 'Please upload a certificate image or provide an image URL.';
      }
    }

    setErrors((prev) => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    playTick();
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(4, prev + 1));
    } else {
      showToast('Please resolve the highlighted step requirements.', 'fa-triangle-exclamation');
    }
  };

  const handlePrevStep = () => {
    playTick();
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleJumpToStep = (targetStep) => {
    playTick();
    if (targetStep < currentStep) {
      setErrors({});
      setCurrentStep(targetStep);
      return;
    }
    // If moving forward, validate current step first
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep(targetStep);
    } else {
      showToast('Please complete the current step requirements first.');
    }
  };

  // Open Form for New Certificate
  const handleOpenCreateForm = () => {
    playTick();
    setEditingId(null);
    setForm({
      title: '',
      issuer: '',
      issueDate: '2025',
      category: 'Full Stack Development',
      featured: false,
      credentialId: '',
      credentialUrl: '',
      status: 'Verified',
      downloadUrl: '',
      skillsCovered: '',
      description: '',
      imageUrl: ''
    });
    setErrors({});
    setCurrentStep(1);
    setIsFormOpen(true);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Open Form for Editing
  const handleEdit = (cert) => {
    playTick();
    setEditingId(cert.id);
    setForm({
      title: cert.title || '',
      issuer: cert.issuer || '',
      issueDate: cert.issueDate || cert.year || '2025',
      category: cert.category || 'Full Stack Development',
      featured: Boolean(cert.featured),
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      status: cert.status || 'Verified',
      downloadUrl: cert.downloadUrl || cert.imageUrl || '',
      skillsCovered: cert.skillsCovered || '',
      description: cert.description || '',
      imageUrl: cert.imageUrl || ''
    });
    setErrors({});
    setCurrentStep(1);
    setIsFormOpen(true);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Duplicate Certificate as New Template
  const handleDuplicate = (cert) => {
    playTick();
    setEditingId(null);
    setForm({
      title: `${cert.title} (Copy)`,
      issuer: cert.issuer || '',
      issueDate: cert.issueDate || '2025',
      category: cert.category || 'Full Stack Development',
      featured: false,
      credentialId: '',
      credentialUrl: cert.credentialUrl || '',
      status: cert.status || 'Verified',
      downloadUrl: cert.downloadUrl || cert.imageUrl || '',
      skillsCovered: cert.skillsCovered || '',
      description: cert.description || '',
      imageUrl: cert.imageUrl || ''
    });
    setErrors({});
    setCurrentStep(1);
    setIsFormOpen(true);
    showToast(`Cloned template from "${cert.title}".`);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Instant Toggle Featured Star
  const handleToggleFeatured = (cert) => {
    playTick();
    const updatedStatus = !cert.featured;
    updateAppState(
      (prev) => ({
        ...prev,
        certificates: (prev.certificates || []).map((c) =>
          c.id === cert.id ? { ...c, featured: updatedStatus } : c
        )
      }),
      session.token
    );
    showToast(
      updatedStatus
        ? `★ "${cert.title}" marked as Featured Flagship.`
        : `Unmarked "${cert.title}" as featured.`
    );
  };

  // Cancel Edit / Reset Form
  const handleCancelEdit = () => {
    playTick();
    setEditingId(null);
    setIsFormOpen(false);
    setForm({
      title: '',
      issuer: '',
      issueDate: '2025',
      category: 'Full Stack Development',
      featured: false,
      credentialId: '',
      credentialUrl: '',
      status: 'Verified',
      downloadUrl: '',
      skillsCovered: '',
      description: '',
      imageUrl: ''
    });
    setErrors({});
    setCurrentStep(1);
  };

  // Delete Certificate
  const handleDelete = (cert) => {
    playTick();
    openConfirmModal(
      'Delete Certificate',
      `Are you sure you want to permanently delete "${cert.title}"? This cannot be undone.`,
      () => {
        updateAppState(
          (prev) => ({
            ...prev,
            certificates: (prev.certificates || []).filter((c) => c.id !== cert.id)
          }),
          session.token
        );
        if (editingId === cert.id) {
          handleCancelEdit();
        }
        showToast(`Certificate "${cert.title}" deleted.`);
      }
    );
  };

  // Submit / Save Certificate
  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    playTick();

    const check = validateCertificateForm(form);
    if (!check.isValid) {
      setErrors(check.errors);
      if (check.errors.title || check.errors.issuer || check.errors.issueDate) {
        setCurrentStep(1);
      } else if (check.errors.imageUrl) {
        setCurrentStep(4);
      }
      showToast('Please fix all form validation errors before saving.', 'fa-triangle-exclamation');
      return;
    }

    const certPayload = {
      ...form,
      year: form.issueDate,
      downloadUrl: form.downloadUrl || form.imageUrl,
      updatedAt: new Date().toISOString()
    };

    updateAppState(
      (prev) => {
        const certs = prev.certificates || [];
        if (editingId) {
          return {
            ...prev,
            certificates: certs.map((c) => (c.id === editingId ? { ...c, ...certPayload } : c))
          };
        }
        return {
          ...prev,
          certificates: [{ id: 'cert-' + Date.now(), ...certPayload }, ...certs]
        };
      },
      session.token
    );

    showToast(
      editingId
        ? `Successfully updated "${form.title}".`
        : `Successfully published "${form.title}".`,
      'fa-certificate'
    );
    handleCancelEdit();
  };

  // Cloudinary image upload handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    showToast('Uploading certificate image to Cloudinary...', 'fa-cloud-arrow-up');
    try {
      const url = await uploadImageViaCloudinary(file, appState.settings);
      if (url) {
        setForm((prev) => ({
          ...prev,
          imageUrl: url,
          downloadUrl: prev.downloadUrl || url
        }));
        setErrors((prev) => ({ ...prev, imageUrl: '' }));
        showToast('Certificate badge uploaded successfully!', 'fa-check');
      } else {
        showToast('Failed to upload image. Please verify Cloudinary credentials.', 'fa-triangle-exclamation');
      }
    } catch {
      showToast('Error uploading image to Cloudinary.', 'fa-circle-xmark');
    } finally {
      setIsUploading(false);
    }
  };

  // 3D Tilt Effect on Preview Card
  const handlePreviewMouseMove = (e) => {
    const card = previewCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gsap.to(card, {
      rotateX: ((y - rect.height / 2) / rect.height) * -8,
      rotateY: ((x - rect.width / 2) / rect.width) * 8,
      transformPerspective: 1200,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handlePreviewMouseLeave = () => {
    const card = previewCardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // Unique Issuers for filtering
  const uniqueIssuers = useMemo(() => {
    const set = new Set();
    certificates.forEach((c) => {
      if (c.issuer) set.add(c.issuer.trim());
    });
    return Array.from(set);
  }, [certificates]);

  // Filtered & Sorted Certificates List
  const filteredCertificates = useMemo(() => {
    let list = [...certificates];

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.issuer || '').toLowerCase().includes(q) ||
          (c.credentialId || '').toLowerCase().includes(q) ||
          (c.skillsCovered || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q)
      );
    }

    // Issuer Filter
    if (selectedIssuer !== 'ALL') {
      list = list.filter((c) => (c.issuer || '').toLowerCase() === selectedIssuer.toLowerCase());
    }

    // Status Filter
    if (selectedStatus === 'FEATURED') {
      list = list.filter((c) => Boolean(c.featured));
    } else if (selectedStatus === 'VERIFIED') {
      list = list.filter((c) => c.status === 'Verified' || c.credentialUrl);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        const yearA = parseInt(a.issueDate || a.year || '0', 10);
        const yearB = parseInt(b.issueDate || b.year || '0', 10);
        return yearB - yearA;
      }
      if (sortBy === 'oldest') {
        const yearA = parseInt(a.issueDate || a.year || '0', 10);
        const yearB = parseInt(b.issueDate || b.year || '0', 10);
        return yearA - yearB;
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'issuer-asc') {
        return (a.issuer || '').localeCompare(b.issuer || '');
      }
      return 0;
    });

    return list;
  }, [certificates, searchQuery, selectedIssuer, selectedStatus, sortBy]);

  // Metrics
  const totalCount = certificates.length;
  const featuredCount = certificates.filter((c) => Boolean(c.featured)).length;
  const verifiedCount = certificates.filter((c) => c.status === 'Verified' || c.credentialUrl).length;

  return (
    <div className="space-y-8" ref={formTopRef}>
      {/* ========================================================
          1. TOP METRICS & QUICK ACTIONS DASHBOARD
         ======================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl transition-all hover:border-cyan-500/30">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Total Credentials</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-white">{totalCount}</span>
            <span className="font-mono text-xs text-cyan-400">Issued</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl transition-all hover:border-amber-500/30">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Featured Flagship</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400">
              {featuredCount}
            </span>
            <span className="font-mono text-xs text-amber-500/80">★ Hero</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl transition-all hover:border-emerald-500/30">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Verified Badges</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {verifiedCount}
            </span>
            <span className="font-mono text-xs text-emerald-500/80">Active</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl transition-all hover:border-purple-500/30">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Accredited Issuers</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-purple-400">
              {uniqueIssuers.length}
            </span>
            <span className="font-mono text-xs text-purple-400/80">Partners</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex flex-col justify-center">
          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="w-full h-full min-h-[58px] rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] transition-all hover:scale-[1.02] shadow-lg shadow-cyan-500/20"
          >
            <div className="flex h-full w-full items-center justify-center gap-2 rounded-[14px] bg-[#0c121e] px-4 py-3 text-xs font-bold text-white transition-all hover:bg-transparent">
              <i className="fa-solid fa-plus text-cyan-400" />
              <span>New Certificate</span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. LIVE SECTION HEADINGS CUSTOMIZER (COLLAPSIBLE)
         ======================================================== */}
      <div className="glass-card-admin rounded-3xl border border-white/10 p-5 sm:p-6 transition-all hover:border-purple-500/30">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => {
            playTick();
            setIsHeadingsOpen(!isHeadingsOpen);
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
              <i className="fa-solid fa-heading" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white sm:text-base">Certificates Section Headings</h3>
              <p className="text-xs text-slate-400">
                Customize dynamic eyebrow tag and headline displayed on the public Certificates page.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white"
          >
            <i className={`fa-solid fa-chevron-${isHeadingsOpen ? 'up' : 'down'} text-xs`} />
          </button>
        </div>

        {isHeadingsOpen && (
          <div className="mt-5 border-t border-white/10 pt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in duration-200">
            <div>
              <label className="block font-mono text-xs font-semibold text-slate-300 mb-1.5">
                Eyebrow Tagline
              </label>
              <input
                type="text"
                value={appState.uiLabels?.homeCertificatesEyebrow ?? '03 · VERIFIED CREDENTIALS'}
                onChange={(e) =>
                  updateAppState(
                    (prev) => ({
                      ...prev,
                      uiLabels: { ...prev.uiLabels, homeCertificatesEyebrow: e.target.value }
                    }),
                    session.token
                  )
                }
                className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                placeholder="03 · VERIFIED CREDENTIALS"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-semibold text-slate-300 mb-1.5">
                Main Page Heading
              </label>
              <input
                type="text"
                value={
                  appState.uiLabels?.homeCertificatesHeading ??
                  'Technical Certifications & Honors'
                }
                onChange={(e) =>
                  updateAppState(
                    (prev) => ({
                      ...prev,
                      uiLabels: { ...prev.uiLabels, homeCertificatesHeading: e.target.value }
                    }),
                    session.token
                  )
                }
                className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                placeholder="Technical Certifications & Honors"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          3. MULTI-STAGE WIZARD FORM (TOP 1% EXPERIENCE)
         ======================================================== */}
      {isFormOpen && (
        <div className="glass-card-admin rounded-3xl border border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Form Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-400 shadow-md shadow-cyan-500/20">
                <i className={editingId ? 'fa-solid fa-pen-nib' : 'fa-solid fa-certificate'} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {editingId ? `Edit Certificate: ${form.title || 'Untitled'}` : 'Add New Certificate'}
                  </h2>
                  {form.featured && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                      ★ Flagship
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Step {currentStep} of 4 · Follow the wizard to publish a high-impact verified credential.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-300 hover:border-white/20 hover:text-white transition-all"
            >
              <i className="fa-solid fa-xmark" />
              <span>Cancel</span>
            </button>
          </div>

          {/* Stepper Progress Bar & Stage Indicator */}
          <div className="space-y-3">
            {/* Visual Step Progress Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 transition-all duration-300 ease-out shadow-sm shadow-cyan-400"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { step: 1, title: 'Core Details', icon: 'fa-id-card', desc: 'Title, Issuer & Date' },
                { step: 2, title: 'Verification', icon: 'fa-shield-halved', desc: 'ID, Links & Status' },
                { step: 3, title: 'Skills & Tags', icon: 'fa-tags', desc: 'Tech & Highlights' },
                { step: 4, title: 'Media & 3D Preview', icon: 'fa-cube', desc: 'Image & Live Card' }
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isPassed = currentStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => handleJumpToStep(item.step)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/15'
                        : isPassed
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-300 hover:border-emerald-500/50'
                        : 'border-white/10 bg-black/40 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/40'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {isPassed ? <i className="fa-solid fa-check text-xs" /> : `0${item.step}`}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==========================================
              STAGE 1: CORE INFORMATION
             ========================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Certificate Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-mono text-xs font-semibold text-slate-200">
                      Certificate Title *
                    </label>
                    <span className="font-mono text-[10px] text-slate-400">
                      {form.title.length} chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Full Stack Web Development (MERN)"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                  />
                  <FormErrorMessage message={errors.title} />
                </div>

                {/* Category / Domain */}
                <div>
                  <label className="block font-mono text-xs font-semibold text-slate-200 mb-1.5">
                    Category / Domain
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all"
                  >
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0b101b] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Issuer with Quick Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs font-semibold text-slate-200">
                    Issuer / Organization *
                  </label>
                  <span className="font-mono text-[10px] text-cyan-400">Quick presets available</span>
                </div>
                <input
                  type="text"
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                  placeholder="e.g. Apna College / Meta / Amazon Web Services"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                />
                <FormErrorMessage message={errors.issuer} />

                {/* Issuer Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-mono text-[10px] text-slate-500">Presets:</span>
                  {COMMON_ISSUERS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        playTick();
                        setForm({ ...form, issuer: preset });
                        setErrors((prev) => ({ ...prev, issuer: '' }));
                      }}
                      className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-all ${
                        form.issuer === preset
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue Date & Featured Toggle */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 items-center">
                <div className="space-y-2">
                  <label className="block font-mono text-xs font-semibold text-slate-200">
                    Issue Year / Date *
                  </label>
                  <input
                    type="text"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    placeholder="2025"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                  />
                  <FormErrorMessage message={errors.issueDate} />

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="font-mono text-[10px] text-slate-500">Year:</span>
                    {COMMON_YEARS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          playTick();
                          setForm({ ...form, issueDate: yr });
                          setErrors((prev) => ({ ...prev, issueDate: '' }));
                        }}
                        className={`rounded-md border px-2 py-0.5 font-mono text-[10px] transition-all ${
                          form.issueDate === yr
                            ? 'border-purple-400 bg-purple-500/20 text-purple-300 font-bold'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Flagship Switch */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <i className="fa-solid fa-star text-amber-400" />
                        <span>Featured Flagship Credential</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Showcase prominently with 2-column hero display on the certificates grid.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playTick();
                        setForm((prev) => ({ ...prev, featured: !prev.featured }));
                      }}
                      className={`relative h-6 w-12 rounded-full transition-colors ${
                        form.featured ? 'bg-amber-400' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-black transition-transform ${
                          form.featured ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              STAGE 2: CREDENTIALS & VERIFICATION
             ========================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Credential ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-xs font-semibold text-slate-200">
                      Credential ID / Serial
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateId}
                      className="font-mono text-[10px] text-cyan-400 hover:underline"
                    >
                      ⚡ Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.credentialId}
                    onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                    placeholder="e.g. CERT-2025-AP01 or UC-8df3..."
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                </div>

                {/* Status Badge */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs font-semibold text-slate-200">
                    Accreditation Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Verified', 'Accredited', 'In Review'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          playTick();
                          setForm({ ...form, status: st });
                        }}
                        className={`rounded-xl border py-2.5 px-3 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          form.status === st
                            ? st === 'Verified'
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                              : st === 'Accredited'
                              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                              : 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            st === 'Verified'
                              ? 'fa-circle-check'
                              : st === 'Accredited'
                              ? 'fa-award'
                              : 'fa-clock'
                          } text-[10px]`}
                        />
                        <span>{st}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification URL with Live Tester */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs font-semibold text-slate-200">
                    Verification URL (Issuer portal validation link)
                  </label>
                  {form.credentialUrl && isValidUrl(form.credentialUrl) && (
                    <a
                      href={form.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Test Link ↗</span>
                    </a>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={form.credentialUrl}
                    onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
                    placeholder="https://coursera.org/verify/... or https://badgr.com/..."
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                  />
                  {form.credentialUrl && (
                    <span className="absolute right-3.5 text-xs">
                      {isValidUrl(form.credentialUrl) ? (
                        <i className="fa-solid fa-check text-emerald-400" />
                      ) : (
                        <i className="fa-solid fa-triangle-exclamation text-amber-400" />
                      )}
                    </span>
                  )}
                </div>
                <FormErrorMessage message={errors.credentialUrl} />
              </div>

              {/* Download / High-Res Asset URL */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-semibold text-slate-200">
                  Direct High-Res Asset URL (Optional)
                </label>
                <input
                  type="url"
                  value={form.downloadUrl}
                  onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                  placeholder="https://... (defaults to the uploaded certificate image if left blank)"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                />
                <FormErrorMessage message={errors.downloadUrl} />
              </div>
            </div>
          )}

          {/* ==========================================
              STAGE 3: SKILLS & TAXONOMY
             ========================================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Interactive Skill Tag Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs font-semibold text-slate-200">
                    Interactive Skill Tags (Type & Press Enter or comma)
                  </label>
                  <span className="font-mono text-[10px] text-cyan-400">
                    {currentSkillTags.length} active skills
                  </span>
                </div>

                {/* Active Skill Tag Pills */}
                <div className="min-h-[50px] rounded-2xl border border-white/15 bg-black/40 p-3 flex flex-wrap items-center gap-2">
                  {currentSkillTags.length > 0 ? (
                    currentSkillTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 shadow-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(tag)}
                          className="hover:text-white transition-colors"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="font-mono text-xs text-slate-500 italic">
                      No skill tags added yet. Type below or click quick suggestions.
                    </span>
                  )}
                </div>

                {/* Input row */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skillTagInput}
                    onChange={(e) => setSkillTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddSkillTag();
                      }
                    }}
                    placeholder="Type skill (e.g. React, Docker, Python) and press Enter..."
                    className="flex-1 rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillTag()}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/20 px-4 py-2.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all"
                  >
                    + Add
                  </button>
                </div>

                {/* Recommended Skill Chips */}
                <div className="space-y-1.5 pt-2">
                  <p className="font-mono text-[10px] text-slate-400">Quick Skill Suggestions:</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {RECOMMENDED_SKILLS.map((skill) => {
                      const isSelected = currentSkillTags.some(
                        (t) => t.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleToggleRecommendedSkill(skill)}
                          className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Syllabus / Highlights Summary */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-semibold text-slate-200">
                  Course Highlights / Curriculum Summary (Optional)
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Summarize key topics covered, projects built, or honors received..."
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>
          )}

          {/* ==========================================
              STAGE 4: MEDIA & 3D LIVE PREVIEW
             ========================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                {/* Image Upload Column (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block font-mono text-xs font-semibold text-slate-200 mb-1.5">
                      Certificate Badge / Certificate Document *
                    </label>

                    {/* Drag & Drop Upload Zone */}
                    <div className="rounded-2xl border-2 border-dashed border-white/20 bg-black/40 p-6 text-center hover:border-cyan-400/50 transition-all">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3">
                        <i className="fa-solid fa-cloud-arrow-up text-xl" />
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">
                        Upload Credential to Cloudinary
                      </p>
                      <p className="text-xs text-slate-400 mb-4">
                        Supports PNG, JPG, WEBP high-resolution badge or certificate scans.
                      </p>

                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-2.5 font-mono text-xs font-bold text-black hover:opacity-90 shadow-md shadow-cyan-400/20 transition-all">
                        <i className="fa-solid fa-folder-open" />
                        <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <FormErrorMessage message={errors.imageUrl} />
                  </div>

                  {/* Direct URL Input fallback */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs font-semibold text-slate-300">
                      Or Direct Image URL (HTTPS)
                    </label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => {
                        setForm({ ...form, imageUrl: e.target.value });
                        setErrors((prev) => ({ ...prev, imageUrl: '' }));
                      }}
                      placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>

                  {/* Summary Checklist */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2 text-xs">
                    <p className="font-mono font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Publishing Checklist
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div className="flex items-center gap-2">
                        <i
                          className={`fa-solid ${
                            form.title ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-red-400'
                          }`}
                        />
                        <span>Title: {form.title ? 'Ready' : 'Missing'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i
                          className={`fa-solid ${
                            form.issuer ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-red-400'
                          }`}
                        />
                        <span>Issuer: {form.issuer || 'Missing'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i
                          className={`fa-solid ${
                            currentSkillTags.length > 0
                              ? 'fa-circle-check text-emerald-400'
                              : 'fa-circle-exclamation text-amber-400'
                          }`}
                        />
                        <span>Skills: {currentSkillTags.length} tagged</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i
                          className={`fa-solid ${
                            form.imageUrl
                              ? 'fa-circle-check text-emerald-400'
                              : 'fa-circle-xmark text-red-400'
                          }`}
                        />
                        <span>Image: {form.imageUrl ? 'Attached' : 'Required'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live 3D Preview Column (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      Live 3D Public Preview
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Hover to tilt</span>
                  </div>

                  {/* Live Rendered Certificate Card */}
                  <div
                    ref={previewCardRef}
                    onMouseMove={handlePreviewMouseMove}
                    onMouseLeave={handlePreviewMouseLeave}
                    className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-[#111827] to-[#070b12] p-5 shadow-2xl transition-all will-change-transform overflow-hidden"
                  >
                    {/* Featured Ribbon */}
                    {form.featured && (
                      <div className="absolute top-3 right-3 z-10 rounded-full border border-amber-400/40 bg-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300 shadow-md">
                        ★ FLAGSHIP HERO
                      </div>
                    )}

                    {/* Image / Thumbnail */}
                    <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-xl border border-white/10 bg-black/60 group">
                      {form.imageUrl ? (
                        <img
                          src={form.imageUrl}
                          alt={form.title || 'Certificate preview'}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                          <i className="fa-solid fa-certificate text-3xl text-slate-600 mb-2" />
                          <p className="font-mono text-[11px] text-slate-500">
                            No image uploaded yet
                          </p>
                        </div>
                      )}

                      {/* Zoom overlay on preview image */}
                      {form.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              playTick();
                              // Open lightbox with mock cert
                              if (openCertificateLightbox) {
                                openCertificateLightbox(editingId || 'preview-temp');
                              }
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-black shadow-lg shadow-cyan-400/50"
                            title="Inspect in Lightbox"
                          >
                            <i className="fa-solid fa-expand" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold uppercase tracking-wider text-cyan-400">
                          {form.issuer || 'ISSUER'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                          {form.issueDate || '2025'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white line-clamp-2">
                        {form.title || 'Certificate Title Preview'}
                      </h4>

                      <p className="font-mono text-[11px] text-slate-400 line-clamp-2">
                        Skills: {form.skillsCovered || 'FULL-STACK, ARCHITECTURE, ENGINEERING'}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                          <i className="fa-solid fa-circle-check" /> {form.status || 'Verified'}
                        </span>

                        {form.credentialUrl && (
                          <span className="font-mono text-[11px] text-cyan-400">
                            Verify Credential ↗
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              WIZARD CONTROLS / NAVIGATION FOOTER
             ========================================== */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs font-semibold text-slate-300 hover:border-white/30 hover:text-white transition-all"
                >
                  <i className="fa-solid fa-arrow-left" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="font-mono text-xs text-slate-400 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-2.5 font-mono text-xs font-bold text-black hover:opacity-90 transition-all shadow-md shadow-cyan-400/20"
                >
                  <span>
                    Next:{' '}
                    {currentStep === 1
                      ? 'Credentials'
                      : currentStep === 2
                      ? 'Skills & Tags'
                      : 'Media & Preview'}
                  </span>
                  <i className="fa-solid fa-arrow-right" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 px-6 py-2.5 font-mono text-xs font-extrabold text-black hover:opacity-90 transition-all shadow-lg shadow-emerald-400/30"
                >
                  <i className="fa-solid fa-cloud-arrow-up" />
                  <span>{editingId ? 'Update Certificate' : 'Publish Certificate'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. EXISTING CERTIFICATES LIST & MANAGEMENT TOOLBAR
         ======================================================== */}
      <div className="glass-card-admin rounded-3xl border border-white/10 p-6 space-y-6">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Existing Credentials</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-cyan-400">
                {filteredCertificates.length} / {certificates.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage, star featured flagship credentials, inspect in pan/zoom lightbox, edit, or delete.
            </p>
          </div>

          {!isFormOpen && (
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 font-mono text-xs font-bold text-black hover:bg-cyan-300 transition-all shadow-md shadow-cyan-400/20"
            >
              <i className="fa-solid fa-plus" />
              <span>Add Credential</span>
            </button>
          )}
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-center">
          {/* Search Input (5 cols) */}
          <div className="md:col-span-5 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, issuer, credential ID, skills..."
              className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Issuer Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedIssuer}
              onChange={(e) => {
                playTick();
                setSelectedIssuer(e.target.value);
              }}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Issuers ({certificates.length})</option>
              {uniqueIssuers.map((iss) => (
                <option key={iss} value={iss} className="bg-[#0b101b] text-white">
                  {iss}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                playTick();
                setSelectedStatus(e.target.value);
              }}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Status</option>
              <option value="FEATURED">★ Featured Only</option>
              <option value="VERIFIED">✓ Verified Only</option>
            </select>
          </div>

          {/* Sort Selector (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => {
                playTick();
                setSortBy(e.target.value);
              }}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
            >
              <option value="newest">Newest Year</option>
              <option value="oldest">Oldest Year</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="issuer-asc">Issuer (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((cert) => {
              const isEditing = editingId === cert.id;
              const certImg =
                cert.imageUrl ||
                'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=800&auto=format&fit=crop';

              return (
                <div
                  key={cert.id}
                  className={`group relative rounded-2xl border p-4 space-y-3 flex flex-col justify-between transition-all backdrop-blur-xl ${
                    isEditing
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                      : 'border-white/10 bg-black/40 hover:border-white/25 hover:bg-black/60'
                  }`}
                >
                  {/* Card Header & Thumbnail */}
                  <div className="space-y-3">
                    {/* Thumbnail with overlay inspector */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-black/50">
                      <img
                        src={certImg}
                        alt={cert.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Click overlay to open full Pan & Zoom Lightbox */}
                      <button
                        type="button"
                        onClick={() => {
                          playTick();
                          openCertificateLightbox(cert.id);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Inspect in full Lightbox (Pan & Zoom)"
                      >
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-3 py-1 font-mono text-xs font-bold text-black shadow-lg shadow-cyan-400/40">
                          <i className="fa-solid fa-expand" />
                          <span>Inspect</span>
                        </span>
                      </button>

                      {/* Featured Star Badge */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFeatured(cert);
                        }}
                        className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md transition-all ${
                          cert.featured
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-400/50'
                            : 'bg-black/60 text-slate-400 hover:text-amber-300'
                        }`}
                        title={cert.featured ? 'Remove featured' : 'Mark as featured flagship'}
                      >
                        <i className="fa-solid fa-star text-xs" />
                      </button>
                    </div>

                    {/* Metadata Header */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold uppercase tracking-wider text-cyan-400 truncate max-w-[65%]">
                        {cert.issuer || 'Issuer'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                        {cert.issueDate || cert.year || '2025'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-white line-clamp-1" title={cert.title}>
                      {cert.title}
                    </h4>

                    {/* Skills pills */}
                    {cert.skillsCovered && (
                      <p className="font-mono text-[11px] text-slate-400 line-clamp-1" title={cert.skillsCovered}>
                        Skills: <span className="text-slate-300">{cert.skillsCovered}</span>
                      </p>
                    )}

                    {/* Credential ID */}
                    {cert.credentialId && (
                      <p className="font-mono text-[10px] text-purple-400 truncate">
                        ID: {cert.credentialId}
                      </p>
                    )}
                  </div>

                  {/* Actions & Verification */}
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      {cert.credentialUrl ? (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <i className="fa-solid fa-check-circle text-[10px]" />
                          <span>Verify ↗</span>
                        </a>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-500">Unlinked</span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          playTick();
                          openCertificateLightbox(cert.id);
                        }}
                        className="font-mono text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <i className="fa-solid fa-eye text-[10px]" />
                        <span>Inspect</span>
                      </button>
                    </div>

                    {/* Buttons row */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(cert)}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:border-white/20 hover:text-white transition-all flex items-center gap-1"
                        title="Duplicate as new certificate"
                      >
                        <i className="fa-solid fa-copy text-[10px]" />
                        <span>Clone</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(cert)}
                          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1"
                        >
                          <i className="fa-solid fa-pen text-[10px]" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cert)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1"
                        >
                          <i className="fa-solid fa-trash text-[10px]" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center space-y-2">
            <i className="fa-solid fa-filter text-2xl text-slate-600 mb-1" />
            <p className="text-sm font-semibold text-white">No certificates match your search filters.</p>
            <p className="text-xs text-slate-400">
              Try adjusting your query, clearing issuer filters, or add a new certificate.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIssuer('ALL');
                setSelectedStatus('ALL');
              }}
              className="mt-2 rounded-xl border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-slate-300 hover:text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCertificates;
