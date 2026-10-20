import React, { useState } from 'react';
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
    eyebrow: p.eyebrow || 'FULL-STACK DEVELOPER & SOFTWARE ENGINEER',
    headline: p.headline || 'Building resilient full-stack systems and high-performance interfaces.',
    heroDescription: p.heroDescription || '',
    footerTagline: p.footerTagline || 'B.Tech CSE @ SISTec Bhopal (CGPA 8.42) · Crafting high-performance web products.',
    github: p.socialLinks?.github || '',
    linkedin: p.socialLinks?.linkedin || '',
    instagram: p.socialLinks?.instagram || '',
    degree: p.education?.degree || 'B.Tech in Computer Science & Engineering',
    college: p.education?.college || 'Sagar Institute of Science & Technology (SISTec)',
    cgpa: p.education?.cgpa || '8.42',
    stage: p.education?.stage || '2023 – 2027 (Currently in 4th Semester)',
    schoolXII: p.education?.schoolXII || 'Higher Secondary (Class XII)',
    schoolScore: p.education?.schoolScore || '80%',
    schoolBoard: p.education?.schoolBoard || 'MPBSE'
  });

  const [aboutBioList, setAboutBioList] = useState(
    Array.isArray(p.aboutBio) ? p.aboutBio : [
      "I am an enthusiastic Full-Stack Developer and B.Tech CSE undergraduate at SISTec, Bhopal, maintaining a strong CGPA of 8.42. I engineer reliable web architectures with modern JavaScript, Node.js, Express, MongoDB, and React.",
      "My journey centers around clean code, scalable APIs, database optimization, and high-impact user experiences."
    ]
  );
  const [newBioParagraph, setNewBioParagraph] = useState('');

  const [resumeLoading, setResumeLoading] = useState(false);
  const [directResumeUrl, setDirectResumeUrl] = useState(p.resumeUrl || '');

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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    playTick();

    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        displayName: profileForm.displayName.trim(),
        monogram: profileForm.monogram.trim(),
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
    }), session.token);

    showToast('Profile and resume settings saved successfully!', 'fa-check');
  };

  return (
    <div className="space-y-8">
      {/* Resume Management Card */}
      <div className="glass-card-admin p-6 sm:p-8 space-y-5">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-file-pdf text-red-400" />
              <span>Resume / CV Management</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your official PDF resume or paste a permanent cloud URL.
            </p>
          </div>
          {p.resumeUrl && (
            <button
              type="button"
              className="btn-outline text-xs"
              onClick={() => handlePreviewResume(p.resumeUrl)}
            >
              <i className="fa-solid fa-eye" /> Preview Live Resume
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Upload New PDF File
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              disabled={resumeLoading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setResumeLoading(true);
                showToast('Uploading resume file...');
                const res = await uploadResumeFile(file, session?.token);
                setResumeLoading(false);
                if (res?.url) {
                  setDirectResumeUrl(res.url);
                  updateAppState((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, resumeUrl: res.url }
                  }), session.token);
                  showToast('Resume uploaded and saved!', 'fa-circle-check');
                } else {
                  showToast('Failed to upload resume file.');
                }
              }}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:text-black file:font-bold file:text-xs hover:file:opacity-90"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Or Direct Resume URL
            </label>
            <input
              type="text"
              value={directResumeUrl}
              onChange={(e) => setDirectResumeUrl(e.target.value)}
              placeholder="https://.../resume.pdf"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-card-admin p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
          Personal & Contact Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Display Name *</label>
            <input
              type="text"
              value={profileForm.displayName}
              onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Monogram (e.g. AP) *</label>
            <input
              type="text"
              value={profileForm.monogram}
              onChange={(e) => setProfileForm({ ...profileForm, monogram: e.target.value })}
              maxLength={4}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Email Address *</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Phone Number *</label>
            <input
              type="text"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Location *</label>
            <input
              type="text"
              value={profileForm.location}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Header Subtitle</label>
            <input
              type="text"
              value={profileForm.headerSubtitle}
              onChange={(e) => setProfileForm({ ...profileForm, headerSubtitle: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Hero Eyebrow Tag</label>
            <input
              type="text"
              value={profileForm.eyebrow}
              onChange={(e) => setProfileForm({ ...profileForm, eyebrow: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-slate-400 mb-1">Main Hero Headline</label>
          <input
            type="text"
            value={profileForm.headline}
            onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* Education Details */}
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 pt-4">
          Academic Credentials
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Degree Program *</label>
            <input
              type="text"
              value={profileForm.degree}
              onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">College / Institute *</label>
            <input
              type="text"
              value={profileForm.college}
              onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Current CGPA *</label>
            <input
              type="text"
              value={profileForm.cgpa}
              onChange={(e) => setProfileForm({ ...profileForm, cgpa: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Social Links */}
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 pt-4">
          Social & Portfolio Links
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">GitHub Profile URL</label>
            <input
              type="text"
              value={profileForm.github}
              onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">LinkedIn Profile URL</label>
            <input
              type="text"
              value={profileForm.linkedin}
              onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">Instagram Profile URL</label>
            <input
              type="text"
              value={profileForm.instagram}
              onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* About Bio Paragraphs */}
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 pt-4">
          About Biography Paragraphs
        </h3>

        <div className="space-y-3">
          {aboutBioList.map((para, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <textarea
                rows="2"
                value={para}
                onChange={(e) => {
                  const updated = [...aboutBioList];
                  updated[idx] = e.target.value;
                  setAboutBioList(updated);
                }}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setAboutBioList(aboutBioList.filter((_, i) => i !== idx));
                }}
                className="p-2 text-red-400 hover:text-red-300"
                title="Remove paragraph"
              >
                <i className="fa-solid fa-trash-can text-sm" />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <textarea
              rows="2"
              value={newBioParagraph}
              onChange={(e) => setNewBioParagraph(e.target.value)}
              placeholder="Add another paragraph to your About section..."
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => {
                if (!newBioParagraph.trim()) return;
                playTick();
                setAboutBioList([...aboutBioList, newBioParagraph.trim()]);
                setNewBioParagraph('');
              }}
              className="btn-outline text-xs whitespace-nowrap self-end py-2 px-3"
            >
              Add Bio
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-save px-8 py-3 text-xs font-bold"
        >
          Save All Profile Settings
        </button>
      </form>
    </div>
  );
}

export default AdminProfile;
