import React, { useState, useRef } from 'react';
import { uploadResumeFile } from '../../../services/api';
import { playTick } from '../../../utils/audio';

export function AdminProfile({
  appState,
  updateAppState,
  session,
  showToast
}) {
  const p = appState.profile || {};

  const [profileForm, setProfileForm] = useState({
    displayName: p.displayName || '',
    monogram: p.monogram || 'AP',
    email: p.email || 'ayushprajapati9669@gmail.com',
    phone: p.phone || '9669802554',
    location: p.location || 'Bhopal, Madhya Pradesh, India',
    headerSubtitle: p.headerSubtitle || 'Full-Stack Developer · SISTec, Bhopal',
    eyebrow: p.eyebrow || 'COMPUTER SCIENCE STUDENT · DEVELOPER',
    headline: p.headline || 'Building resilient full-stack systems and high-performance interfaces.',
    heroDescription: p.heroDescription || '',
    footerTagline: p.footerTagline || 'B.Tech CSE @ SISTec Bhopal (CGPA 8.42) · Crafting high-performance web products.',
    github: p.socialLinks?.github || '',
    linkedin: p.socialLinks?.linkedin || '',
    instagram: p.socialLinks?.instagram || '',
    degree: p.education?.degree || 'B.Tech in Computer Science',
    college: p.education?.college || 'SISTec, Bhopal',
    cgpa: p.education?.cgpa || '8.42',
    stage: p.education?.stage || '2023 – 2027 (Currently in 4th Semester)',
    schoolXII: p.education?.schoolXII || 'Higher Secondary (Class XII)',
    schoolScore: p.education?.schoolScore || '80%',
    schoolBoard: p.education?.schoolBoard || 'MPBSE'
  });

  const [aboutBioList, setAboutBioList] = useState(
    Array.isArray(p.aboutBio) && p.aboutBio.length > 0
      ? p.aboutBio
      : [
          'I am a third-year B.Tech Computer Science student at SISTec, Bhopal, focused on building full-stack web applications with the MERN stack.',
          'Alongside developing full-stack interfaces and REST APIs, I actively practice Data Structures and Algorithms in C, Java, and Python.'
        ]
  );
  const [newBioParagraph, setNewBioParagraph] = useState('');

  const [resumeLoading, setResumeLoading] = useState(false);
  const [directResumeUrl, setDirectResumeUrl] = useState(p.resumeUrl || '');
  const [uploadedResumeName, setUploadedResumeName] = useState(
    p.resumeUrl ? p.resumeUrl.split('/').pop()?.split('?')[0] || 'resume.pdf' : ''
  );
  const [uploadedResumeSize, setUploadedResumeSize] = useState(p.resumeUrl ? 'Cloud Hosted PDF' : '');
  const [isDraggingResume, setIsDraggingResume] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const handlePreviewResume = (url) => {
    if (!url) {
      showToast('No resume file URL available.', 'fa-triangle-exclamation');
      return;
    }
    playTick();
    if (url.startsWith('data:')) {
      try {
        const parts = url.split(';base64,');
        const contentType = parts[0].split(':')[1] || 'application/pdf';
        const raw = window.atob(parts[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
      } catch (_err) {
        showToast('Error opening resume preview.');
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please upload an official PDF document.', 'fa-triangle-exclamation');
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedResumeName(file.name);
    setUploadedResumeSize(`${sizeInMB} MB`);
    markDirty();

    setResumeLoading(true);
    showToast('Uploading resume file to cloud...');
    try {
      const res = await uploadResumeFile(file, session?.token);
      if (res?.url) {
        setDirectResumeUrl(res.url);
        updateAppState((prev) => ({
          ...prev,
          profile: { ...prev.profile, resumeUrl: res.url }
        }), session?.token);
        showToast('Resume uploaded and synchronized!', 'fa-circle-check');
      } else {
        showToast('Resume loaded locally. Click Save to persist.', 'fa-check');
      }
    } catch (_err) {
      showToast('Upload error. You can still paste a direct cloud link.');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingResume(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddBio = () => {
    const text = newBioParagraph.trim();
    if (!text) {
      showToast('Please write something before adding a paragraph.', 'fa-triangle-exclamation');
      return;
    }
    playTick();
    setAboutBioList([...aboutBioList, text]);
    setNewBioParagraph('');
    markDirty();
    showToast('Biography paragraph added to draft.', 'fa-circle-plus');
  };

  const handleRemoveBio = (idx) => {
    playTick();
    setAboutBioList(aboutBioList.filter((_, i) => i !== idx));
    markDirty();
    showToast('Paragraph removed.', 'fa-trash');
  };

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    playTick();

    // Validate required fields
    if (!profileForm.displayName.trim() || !profileForm.email.trim() || !profileForm.phone.trim() || !profileForm.location.trim()) {
      showToast('Please fill all required (*) personal fields.', 'fa-triangle-exclamation');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateAppState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          displayName: profileForm.displayName.trim(),
          monogram: (profileForm.monogram.trim() || 'AP').toUpperCase(),
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim(),
          location: profileForm.location.trim(),
          headerSubtitle: profileForm.headerSubtitle.trim(),
          eyebrow: profileForm.eyebrow.trim(),
          headline: profileForm.headline.trim(),
          heroDescription: profileForm.heroDescription.trim(),
          footerTagline: profileForm.footerTagline.trim(),
          resumeUrl: directResumeUrl.trim() || prev.profile?.resumeUrl,
          socialLinks: {
            ...prev.profile?.socialLinks,
            github: profileForm.github.trim(),
            linkedin: profileForm.linkedin.trim(),
            instagram: profileForm.instagram.trim()
          },
          education: {
            ...prev.profile?.education,
            degree: profileForm.degree.trim(),
            college: profileForm.college.trim(),
            cgpa: profileForm.cgpa.trim(),
            stage: profileForm.stage.trim(),
            schoolXII: profileForm.schoolXII.trim(),
            schoolScore: profileForm.schoolScore.trim(),
            schoolBoard: profileForm.schoolBoard.trim()
          },
          aboutBio: aboutBioList
        }
      }), session?.token);

      setIsSaving(false);
      setIsDirty(false);
      showToast('Profile and resume settings published successfully!', 'fa-circle-check');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-400/10">
            <i className="fa-solid fa-user-gear text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Profile & Resume Management</h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Core Settings
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Update personal identity, official resume PDF, credentials, and live bio.
            </p>
          </div>
        </div>

        {/* Auto-Save & Action Status Indicator */}
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

          {directResumeUrl && (
            <button
              type="button"
              onClick={() => handlePreviewResume(directResumeUrl)}
              className="flex items-center gap-1.5 font-mono text-xs px-3.5 py-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm shadow-cyan-500/10"
            >
              <i className="fa-solid fa-file-pdf text-red-400" />
              <span>Preview Live Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 12-Column Layout Grid (Matching reference deepseek_html_20261022_d14817.html) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN (xl:col-span-4): Sticky Live Rendering Simulation Card
            ========================================================================= */}
        <div className="xl:col-span-4 xl:sticky xl:top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
              <i className="fa-solid fa-mobile-screen text-cyan-400" />
              <span>Live Rendering</span>
            </h3>
            <span className="font-mono text-[10px] text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
              Simulation
            </span>
          </div>

          {/* Live Preview Card */}
          <div className="glass-card-admin rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-white/10 bg-[#0b1120]/80 backdrop-blur-xl">
            {/* Top Accent Glowing Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-60" />

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-cyan-500/20 transition-all">
                {profileForm.monogram || 'AP'}
              </div>
              <div className="overflow-hidden min-w-0">
                <h4 className="text-base font-bold text-white truncate">
                  {profileForm.displayName || 'Ayush Prajapati'}
                </h4>
                <p className="text-xs text-[#06b6d4] truncate font-medium mt-0.5">
                  {profileForm.headerSubtitle || 'Full-Stack Developer'}
                </p>
              </div>
            </div>

            {/* Contact Stack */}
            <div className="space-y-2.5 text-xs text-slate-300 mb-5">
              <div className="flex items-start gap-2.5 text-slate-400">
                <i className="fa-regular fa-envelope text-cyan-400 w-4 mt-0.5 shrink-0" />
                <span className="break-all">{profileForm.email || 'ayushprajapati9669@gmail.com'}</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-400">
                <i className="fa-solid fa-location-dot text-cyan-400 w-4 mt-0.5 shrink-0" />
                <span className="truncate">{profileForm.location || 'Bhopal, MP, India'}</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-400">
                <i className="fa-solid fa-phone text-cyan-400 w-4 mt-0.5 shrink-0" />
                <span>{profileForm.phone || '(+91) 9669802554'}</span>
              </div>
            </div>

            <hr className="border-white/10 my-4" />

            {/* Education Info */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Academic Background
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-200 font-semibold truncate">
                  {profileForm.degree || 'B.Tech in Computer Science'}
                </p>
                {profileForm.cgpa && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                    {profileForm.cgpa} CGPA
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {profileForm.college || 'SISTec, Bhopal'}
              </p>
            </div>

            {/* Social Links with Real Brand Icons */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Social Networks
              </p>
              <div className="flex gap-2">
                {/* GitHub */}
                <a
                  href={profileForm.github || '#'}
                  target={profileForm.github ? '_blank' : '_self'}
                  rel="noreferrer"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                    profileForm.github
                      ? 'bg-black/50 border-white/20 text-white hover:bg-black hover:border-white shadow-sm'
                      : 'bg-white/[0.03] border-white/5 text-slate-500 opacity-40 cursor-not-allowed'
                  }`}
                  title={profileForm.github ? 'GitHub Profile' : 'GitHub Not Connected'}
                >
                  <i className="fa-brands fa-github text-base" />
                </a>

                {/* LinkedIn */}
                <a
                  href={profileForm.linkedin || '#'}
                  target={profileForm.linkedin ? '_blank' : '_self'}
                  rel="noreferrer"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                    profileForm.linkedin
                      ? 'bg-[#0077b5]/10 border-[#0077b5]/40 text-[#0077b5] hover:bg-[#0077b5] hover:text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/5 text-slate-500 opacity-40 cursor-not-allowed'
                  }`}
                  title={profileForm.linkedin ? 'LinkedIn Profile' : 'LinkedIn Not Connected'}
                >
                  <i className="fa-brands fa-linkedin-in text-base" />
                </a>

                {/* Instagram */}
                <a
                  href={profileForm.instagram || '#'}
                  target={profileForm.instagram ? '_blank' : '_self'}
                  rel="noreferrer"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                    profileForm.instagram
                      ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/5 text-slate-500 opacity-40 cursor-not-allowed'
                  }`}
                  title={profileForm.instagram ? 'Instagram Profile' : 'Instagram Not Connected'}
                >
                  <i className="fa-brands fa-instagram text-base" />
                </a>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1.5 font-mono">
            <i className="fa-solid fa-circle-info text-cyan-400/80" />
            <span>Updates dynamically as you edit the settings below.</span>
          </p>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (xl:col-span-8): Dedicated Scrollable Form Panel with Docked Action Bar
            ========================================================================= */}
        <div className="xl:col-span-8 flex flex-col xl:h-[calc(100vh-250px)] min-h-[500px]">
          {/* Scrollable Form Cards Area */}
          <div className="flex-1 xl:overflow-y-auto space-y-6 xl:pr-3 custom-admin-scrollbar pb-6 min-h-0">
            {/* 1. RESUME / CV DOCUMENT UPLOADER */}
            <div className="glass-card-admin p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-file-pdf" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resume / CV Document</h3>
                <p className="text-xs text-slate-400">
                  Upload your official PDF resume for public recruiters. Max size 5MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Drag & Drop Box */}
              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingResume(true);
                  }}
                  onDragLeave={() => setIsDraggingResume(false)}
                  onDrop={handleResumeDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer h-[110px] text-center ${
                    isDraggingResume
                      ? 'border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-400/20'
                      : 'border-white/15 bg-black/40 hover:border-cyan-400/60 hover:bg-black/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={resumeLoading}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {resumeLoading ? (
                    <div className="flex flex-col items-center gap-1.5 text-cyan-400 font-mono text-xs">
                      <i className="fa-solid fa-circle-notch fa-spin text-lg" />
                      <span>Uploading PDF...</span>
                    </div>
                  ) : directResumeUrl ? (
                    <div className="flex flex-col items-center gap-1 w-full px-2">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <i className="fa-solid fa-circle-check text-sm" />
                        <span className="truncate max-w-[200px]">{uploadedResumeName || 'resume.pdf'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{uploadedResumeSize || 'Ready for download'}</span>
                      <span className="text-[10px] text-cyan-400 hover:underline mt-0.5">Click to replace file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <i className="fa-solid fa-cloud-arrow-up text-xl text-cyan-400" />
                      <p className="text-xs font-semibold text-white">Click or drag PDF to upload</p>
                      <p className="text-[10px] font-mono text-slate-400">PDF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Link Input */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-slate-300 font-semibold">
                  Or Direct Cloud Resume Link
                </label>
                <div className="relative">
                  <i className="fa-solid fa-link absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                  <input
                    type="url"
                    value={directResumeUrl}
                    onChange={(e) => {
                      setDirectResumeUrl(e.target.value);
                      markDirty();
                    }}
                    placeholder="https://drive.google.com/... or https://.../resume.pdf"
                    className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-3.5 py-3 text-xs text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Used by the navbar "Resume" button and Hire/Connect section.
                </p>
              </div>
            </div>
          </div>

          {/* 2. PERSONAL & CONTACT DETAILS */}
          <div className="glass-card-admin p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <i className="fa-solid fa-user text-cyan-400 text-sm" />
              <h3 className="text-base font-bold text-white">Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, displayName: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="Ayush Prajapati"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Monogram Initials <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={profileForm.monogram}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, monogram: e.target.value.toUpperCase() });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all uppercase font-mono font-bold"
                  placeholder="AP"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, email: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="ayushprajapati9669@gmail.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, phone: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="(+91) 9669802554"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Current Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, location: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="Bhopal, MP, India"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Header Subtitle
                </label>
                <input
                  type="text"
                  value={profileForm.headerSubtitle}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, headerSubtitle: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="Full-Stack Developer · SISTec, Bhopal"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Hero Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={profileForm.eyebrow}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, eyebrow: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="COMPUTER SCIENCE STUDENT · DEVELOPER"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                Main Hero Headline
              </label>
              <input
                type="text"
                value={profileForm.headline}
                onChange={(e) => {
                  setProfileForm({ ...profileForm, headline: e.target.value });
                  markDirty();
                }}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                placeholder="Building resilient full-stack systems and high-performance interfaces."
              />
            </div>
          </div>

          {/* 3. ACADEMIC BACKGROUND */}
          <div className="glass-card-admin p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <i className="fa-solid fa-graduation-cap text-cyan-400 text-sm" />
              <h3 className="text-base font-bold text-white">Academic Background</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Degree Program <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.degree}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, degree: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="B.Tech in Computer Science"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  College / Institute <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.college}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, college: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="SISTec, Bhopal"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Current CGPA <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.cgpa}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, cgpa: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all font-mono font-bold placeholder-slate-500"
                  placeholder="8.42"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Batch / Current Stage
                </label>
                <input
                  type="text"
                  value={profileForm.stage}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, stage: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="2023 – 2027 (Currently in 4th Semester)"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1">
                  Class XII & Board
                </label>
                <input
                  type="text"
                  value={profileForm.schoolXII}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, schoolXII: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="Higher Secondary (Class XII) · 80%"
                />
              </div>
            </div>
          </div>

          {/* 4. SOCIAL NETWORKS */}
          <div className="glass-card-admin p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <i className="fa-solid fa-link text-cyan-400 text-sm" />
              <h3 className="text-base font-bold text-white">Social & Profile Networks</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <i className="fa-brands fa-github text-slate-300" />
                  <span>GitHub Profile</span>
                </label>
                <input
                  type="url"
                  value={profileForm.github}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, github: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="https://github.com/ayushprajapati9669-dev"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <i className="fa-brands fa-linkedin-in text-[#0077b5]" />
                  <span>LinkedIn Profile</span>
                </label>
                <input
                  type="url"
                  value={profileForm.linkedin}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, linkedin: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="https://linkedin.com/in/ayush..."
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <i className="fa-brands fa-instagram text-pink-400" />
                  <span>Instagram Profile</span>
                </label>
                <input
                  type="url"
                  value={profileForm.instagram}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, instagram: e.target.value });
                    markDirty();
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all placeholder-slate-500"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>

          {/* 5. ABOUT BIOGRAPHY PARAGRAPHS */}
          <div className="glass-card-admin p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-align-left text-cyan-400 text-sm" />
                <h3 className="text-base font-bold text-white">About Biography Paragraphs</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Max 300 chars per block</span>
            </div>

            <div className="space-y-3.5">
              {aboutBioList.map((para, idx) => (
                <div key={idx} className="relative group">
                  <textarea
                    rows="3"
                    maxLength={300}
                    value={para}
                    onChange={(e) => {
                      const updated = [...aboutBioList];
                      updated[idx] = e.target.value;
                      setAboutBioList(updated);
                      markDirty();
                    }}
                    className="w-full rounded-xl border border-white/15 bg-black/40 p-3.5 pr-12 pb-7 text-xs text-slate-200 outline-none focus:border-cyan-400 transition-all leading-relaxed resize-none"
                  />
                  <span className="absolute bottom-2.5 right-12 text-[10px] font-mono text-slate-500">
                    {para.length} / 300
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBio(idx)}
                    className="absolute right-3 top-3 w-7 h-7 rounded-lg bg-black/60 text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
                    title="Delete paragraph"
                  >
                    <i className="fa-solid fa-trash-can text-xs" />
                  </button>
                </div>
              ))}

              {/* Add New Paragraph Card */}
              <div className="flex gap-2 items-start pt-1">
                <div className="relative flex-1">
                  <textarea
                    rows="2"
                    maxLength={300}
                    value={newBioParagraph}
                    onChange={(e) => setNewBioParagraph(e.target.value)}
                    placeholder="Write a new paragraph for your About biography..."
                    className="w-full rounded-xl border border-dashed border-white/20 bg-black/30 p-3.5 pr-14 pb-7 text-xs text-slate-300 outline-none focus:border-cyan-400 focus:border-solid transition-all resize-none placeholder-slate-500"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-500">
                    {newBioParagraph.length} / 300
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddBio}
                  className="shrink-0 h-[68px] px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-cyan-500/15 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          </div>

          {/* 6. DOCKED ACTION BAR (Fixed at bottom of right panel, never overlaps inputs) */}
          <div className="shrink-0 pt-3 pb-1 border-t border-white/10 bg-[#0a1118]/95 backdrop-blur-md z-20 shadow-[0_-12px_24px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono w-full sm:w-auto">
                {isDirty ? (
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl">
                    <i className="fa-solid fa-circle-exclamation animate-pulse text-xs" />
                    <span>Unsaved draft changes</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
                    <i className="fa-solid fa-circle-check text-xs" />
                    <span>All changes synced & live</span>
                  </span>
                )}
                <span className="hidden lg:inline text-[11px] text-slate-500 font-mono">
                  · Updates reflected in simulation
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto sm:min-w-[280px] flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500 hover:from-cyan-300 hover:to-sky-400 text-black font-extrabold px-6 py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-base" />
                    <span>Publishing Changes...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-base" />
                    <span>Publish Profile & Resume Changes</span>
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

export default AdminProfile;
