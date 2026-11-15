import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api';
import { playTick } from '../../../utils/audio';

export function AdminSeo({
  appState,
  updateAppState,
  session,
  showToast
}) {
  const currentSettings = appState.settings || {};
  const currentProfile = appState.profile || {};

  const [form, setForm] = useState({
    siteTitle: currentSettings.siteTitle || 'Ayush Prajapati — Full-Stack Developer Portfolio',
    seoTitle: currentSettings.seoTitle || 'Ayush Prajapati | Full-Stack Developer & Software Engineer',
    seoDescription: currentSettings.seoDescription || 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, and scalable full-stack architectures.',
    seoKeywords: currentSettings.seoKeywords || 'Ayush Prajapati, Full-Stack Developer, MERN Stack, React.js, Node.js, SISTec Bhopal, Software Engineer, Portfolio',
    ogTitle: currentSettings.ogTitle || 'Ayush Prajapati — Full-Stack Developer & Software Engineer',
    ogDescription: currentSettings.ogDescription || 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, and scalable full-stack architectures.',
    ogImage: currentSettings.ogImage || '/og-image.png',
    canonicalUrl: currentSettings.canonicalUrl || 'https://ayushprajapati.dev',
    robotsIndex: currentSettings.robotsIndex || 'index, follow',
    author: currentSettings.author || currentProfile.displayName || 'Ayush Prajapati'
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('google'); // 'google' | 'social'

  useEffect(() => {
    setForm({
      siteTitle: currentSettings.siteTitle || 'Ayush Prajapati — Full-Stack Developer Portfolio',
      seoTitle: currentSettings.seoTitle || 'Ayush Prajapati | Full-Stack Developer & Software Engineer',
      seoDescription: currentSettings.seoDescription || 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, and scalable full-stack architectures.',
      seoKeywords: currentSettings.seoKeywords || 'Ayush Prajapati, Full-Stack Developer, MERN Stack, React.js, Node.js, SISTec Bhopal, Software Engineer, Portfolio',
      ogTitle: currentSettings.ogTitle || 'Ayush Prajapati — Full-Stack Developer & Software Engineer',
      ogDescription: currentSettings.ogDescription || 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, and scalable full-stack architectures.',
      ogImage: currentSettings.ogImage || '/og-image.png',
      canonicalUrl: currentSettings.canonicalUrl || 'https://ayushprajapati.dev',
      robotsIndex: currentSettings.robotsIndex || 'index, follow',
      author: currentSettings.author || currentProfile.displayName || 'Ayush Prajapati'
    });
    setIsDirty(false);
  }, [currentSettings.updatedAt]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      setIsDirty(true);
      return next;
    });
  };

  const handleCopyTitleToOg = () => {
    playTick();
    setForm((prev) => ({
      ...prev,
      ogTitle: prev.seoTitle || prev.siteTitle,
      ogDescription: prev.seoDescription
    }));
    setIsDirty(true);
    showToast('Copied SEO Title & Description to OpenGraph!', 'info');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    playTick();

    // Validation
    if (!form.siteTitle.trim()) {
      showToast('Website title is required.', 'error');
      return;
    }
    if (!form.seoDescription.trim()) {
      showToast('Meta description is required for search engines.', 'error');
      return;
    }
    if (form.canonicalUrl && !form.canonicalUrl.startsWith('http://') && !form.canonicalUrl.startsWith('https://')) {
      showToast('Canonical URL must start with https:// or http://', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...currentSettings,
        siteTitle: form.siteTitle.trim(),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        seoKeywords: form.seoKeywords.trim(),
        ogTitle: form.ogTitle.trim(),
        ogDescription: form.ogDescription.trim(),
        ogImage: form.ogImage.trim(),
        canonicalUrl: form.canonicalUrl.trim(),
        robotsIndex: form.robotsIndex.trim(),
        author: form.author.trim()
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
      showToast('SEO metadata and social cards updated successfully!', 'success');
    } catch (err) {
      setIsSaving(false);
      showToast(err.message || 'Failed to save SEO settings.', 'error');
    }
  };

  // Character length indicators
  const titleLen = form.seoTitle.length;
  const descLen = form.seoDescription.length;
  const ogTitleLen = form.ogTitle.length;
  const ogDescLen = form.ogDescription.length;

  return (
    <div className="admin-seo-page space-y-6 animate-in fade-in duration-300">
      {/* Top Action Banner */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest font-semibold flex items-center gap-2" style={{ color: 'var(--brand-color, #dfb740)' }}>
            <i className="fa-solid fa-magnifying-glass" /> SEARCH ENGINE & SOCIAL GRAPH OPTIMIZATION
          </span>
          <h2 className="text-xl font-bold text-white mt-1">SEO & Metadata Settings</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed mt-0.5">
            Optimize search engine ranking, canonical indexing directives, and rich social media OpenGraph previews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-sans text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-black/40">
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
            onClick={handleCopyTitleToOg}
            className="flex items-center gap-1.5 font-sans font-semibold text-xs px-3.5 py-1.5 rounded-xl border border-white/10 bg-black/30 text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-400/30 transition-all"
            title="Sync SEO Title & Description to OpenGraph fields"
          >
            <i className="fa-solid fa-arrows-rotate" />
            <span>Sync to Social</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 font-sans font-semibold text-xs px-4 py-1.5 rounded-xl text-black bg-yellow-400 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-50"
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
          {/* Section 1: Core Search Engine Metadata */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                <i className="fa-brands fa-google text-yellow-400 text-xs" />
                Search Engine Metadata (HTML &lt;head&gt;)
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mt-0.5">
                Defines the title tag, meta description, and indexing rules for Google, Bing, and web spiders.
              </p>
            </div>

            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 font-sans">Default SEO Title Tag</label>
                <span className={`text-[11px] font-mono ${titleLen > 65 ? 'text-red-400' : titleLen >= 40 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {titleLen} / 60 chars (Recommended: 40–60)
                </span>
              </div>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => handleChange('seoTitle', e.target.value)}
                className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-slate-500 focus:border-yellow-400/50 outline-none transition-all"
                placeholder="Ayush Prajapati | Full-Stack Developer & Software Engineer"
                maxLength={120}
              />
            </div>

            {/* SEO Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 font-sans">Meta Description</label>
                <span className={`text-[11px] font-mono ${descLen > 165 ? 'text-red-400' : descLen >= 120 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {descLen} / 160 chars (Recommended: 120–160)
                </span>
              </div>
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => handleChange('seoDescription', e.target.value)}
                className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-slate-500 focus:border-yellow-400/50 outline-none resize-none transition-all leading-relaxed"
                placeholder="Brief summary of professional experience, tech stack, and achievements..."
                maxLength={300}
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">Meta Keywords (Comma-separated)</label>
              <input
                type="text"
                value={form.seoKeywords}
                onChange={(e) => handleChange('seoKeywords', e.target.value)}
                className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-slate-500 focus:border-yellow-400/50 outline-none transition-all"
                placeholder="Full-Stack, MERN, React, Node.js, SISTec Bhopal"
              />
            </div>

            {/* Indexing & Canonical Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">Robots Indexing Directive</label>
                <div className="admin-select-wrapper w-full relative flex items-center">
                  <select
                    value={form.robotsIndex}
                    onChange={(e) => handleChange('robotsIndex', e.target.value)}
                    className="admin-select-field appearance-none bg-[#050a14] border border-white/10 rounded-xl pl-3 pr-8 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 outline-none cursor-pointer transition-all w-full font-sans"
                  >
                    <option value="index, follow" className="bg-[#0b101b] text-white">index, follow (Allow Indexing & Links)</option>
                    <option value="noindex, follow" className="bg-[#0b101b] text-white">noindex, follow (Hide from Search, Follow Links)</option>
                    <option value="noindex, nofollow" className="bg-[#0b101b] text-white">noindex, nofollow (Strictly Private)</option>
                  </select>
                  <i className="admin-select-icon fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">Canonical Base URL</label>
                <input
                  type="url"
                  value={form.canonicalUrl}
                  onChange={(e) => handleChange('canonicalUrl', e.target.value)}
                  className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-slate-500 focus:border-yellow-400/50 outline-none transition-all"
                  placeholder="https://ayushprajapati.dev"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Open Graph & Social Cards */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                <i className="fa-solid fa-share-nodes text-yellow-400 text-xs" />
                Social Media OpenGraph & Twitter Cards
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mt-0.5">
                Controls link previews generated on LinkedIn, Twitter/X, WhatsApp, Discord, and Slack.
              </p>
            </div>

            {/* OG Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 font-sans">OpenGraph Title (og:title)</label>
                <span className={`text-[11px] font-mono ${ogTitleLen > 70 ? 'text-red-400' : 'text-slate-400'}`}>
                  {ogTitleLen} chars
                </span>
              </div>
              <input
                type="text"
                value={form.ogTitle}
                onChange={(e) => handleChange('ogTitle', e.target.value)}
                className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-slate-500 focus:border-yellow-400/50 outline-none transition-all"
                placeholder="Ayush Prajapati — Full-Stack Developer & Software Engineer"
                maxLength={120}
              />
            </div>

            {/* OG Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 font-sans">OpenGraph Description (og:description)</label>
                <span className={`text-[11px] font-mono ${ogDescLen > 200 ? 'text-red-400' : 'text-slate-400'}`}>
                  {ogDescLen} chars
                </span>
              </div>
              <textarea
                rows={2}
                value={form.ogDescription}
                onChange={(e) => handleChange('ogDescription', e.target.value)}
                className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-slate-500 focus:border-yellow-400/50 outline-none resize-none transition-all leading-relaxed"
                placeholder="Social card preview description..."
                maxLength={300}
              />
            </div>

            {/* OG Image URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">Social Sharing Banner (og:image / 1200x630)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.ogImage}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  className="flex-1 text-xs font-sans px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder-slate-500 focus:border-yellow-400/50 outline-none transition-all"
                  placeholder="/og-image.png or https://domain.com/banner.jpg"
                />
                <button
                  type="button"
                  onClick={() => handleChange('ogImage', '/og-image.png')}
                  className="font-sans font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-slate-400 hover:text-white transition-all"
                >
                  Default
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Simulators (5 cols) */}
        <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-6">
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass-chart text-yellow-400" />
                Live Preview Simulators
              </h3>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('google')}
                  className={`px-2.5 py-1 rounded text-xs font-sans font-semibold transition-all ${
                    activePreviewTab === 'google' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Google SERP
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('social')}
                  className={`px-2.5 py-1 rounded text-xs font-sans font-semibold transition-all ${
                    activePreviewTab === 'social' ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Social Card
                </button>
              </div>
            </div>

            {/* Simulator 1: Google SERP Snippet */}
            {activePreviewTab === 'google' && (
              <div className="p-4 rounded-xl border border-white/10 bg-[#202124] text-white space-y-2 font-sans shadow-lg">
                <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                  <span className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-yellow-400">AP</span>
                  <div className="truncate">{form.canonicalUrl || 'https://ayushprajapati.dev'}</div>
                  <span className="text-[10px]">⋮</span>
                </div>
                <h4 className="text-[#8ab4f8] text-base hover:underline cursor-pointer font-normal line-clamp-1">
                  {form.seoTitle || form.siteTitle || 'Ayush Prajapati | Developer Portfolio'}
                </h4>
                <p className="text-[#bdc1c6] text-xs leading-relaxed line-clamp-2">
                  {form.seoDescription || 'Portfolio of Ayush Prajapati, software developer.'}
                </p>
                <div className="text-[10px] font-mono text-[#9aa0a6] pt-1">
                  Directives: <span className="text-emerald-400">{form.robotsIndex}</span>
                </div>
              </div>
            )}

            {/* Simulator 2: Twitter / OpenGraph Card */}
            {activePreviewTab === 'social' && (
              <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden text-white space-y-0 shadow-lg">
                <div className="h-40 bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                  {form.ogImage ? (
                    <img
                      src={form.ogImage}
                      alt="Social Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-yellow-300">
                      1200 x 630 Preview
                    </span>
                  </div>
                </div>
                <div className="p-3.5 space-y-1 bg-zinc-900/90">
                  <div className="text-[10px] font-sans uppercase tracking-wider text-slate-400">
                    {(form.canonicalUrl || 'ayushprajapati.dev').replace(/^https?:\/\//, '')}
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {form.ogTitle || form.seoTitle || 'Ayush Prajapati Portfolio'}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                    {form.ogDescription || form.seoDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-xl font-sans font-semibold text-xs text-black bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    <span>Publishing to Database...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    <span>Publish SEO & Social Settings</span>
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

export default AdminSeo;
