import React, { useState } from 'react';
import { playTick } from '../../../utils/audio';

export function AdminUserGuide({ onSelectTab, showToast }) {
  const [activeToc, setActiveToc] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToSection = (id) => {
    playTick();
    setActiveToc(id);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text, label) => {
    playTick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (showToast) showToast(`${label} copied to clipboard!`, 'fa-circle-check');
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  };

  const fallbackCopy = (text, label) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (showToast) showToast(`${label} copied!`, 'fa-circle-check');
    } catch (_e) {
      if (showToast) showToast('Failed to copy to clipboard.');
    }
    document.body.removeChild(textarea);
  };

  const tocItems = [
    { id: 'overview', label: '1. System Overview', icon: 'fa-cubes' },
    { id: 'profile', label: '2. Managing Profile & Identity', icon: 'fa-user-gear' },
    { id: 'resume', label: '3. Official Resume / CV Upload', icon: 'fa-file-pdf' },
    { id: 'hero', label: '4. Hero Portrait & Canvas', icon: 'fa-image' },
    { id: 'projects', label: '5. Projects (3-Step Wizard)', icon: 'fa-folder' },
    { id: 'certificates', label: '6. Certificates & Credentials', icon: 'fa-certificate' },
    { id: 'skills', label: '7. Technical Skills & Categories', icon: 'fa-code' },
    { id: 'journey', label: '8. About & Milestones', icon: 'fa-timeline' },
    { id: 'messages', label: '9. Recruiter Messages Inbox', icon: 'fa-envelope' },
    { id: 'security', label: '10. Security & Credentials', icon: 'fa-lock' }
  ];

  const filteredToc = tocItems.filter(item =>
    searchQuery === '' || item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 0. TOP ACTION BANNER — consistent with all other admin tabs */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #06b6d4)' }}>
            <i className="fa-solid fa-book-open" /> DOCUMENTATION & OPERATIONS MANUAL
          </span>
          <h2 className="text-xl font-bold text-white mt-1">User Guide & CMS Manual</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Learn how to manage your portfolio content, upload documents, and publish showcase items.
          </p>
        </div>

        {/* Action Button to API Docs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('api-docs', '/admin/api-docs')}
            className="flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-xl border border-white/10 bg-black/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/30 transition-all shadow-sm"
          >
            <i className="fa-solid fa-terminal text-cyan-400" />
            <span>Developer API Reference</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </button>
        </div>
      </div>

      {/* 2-Column Documentation Layout (Left Sticky TOC + Right Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN (lg:col-span-4 xl:col-span-3): Sticky TOC Navigation
            ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="glass-card-admin rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl bg-[#0b1120]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                <i className="fa-solid fa-list-ol text-cyan-400" />
                <span>Documentation Index</span>
              </h3>
              <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                10 Guides
              </span>
            </div>

            {/* Quick TOC Search */}
            <div className="relative mb-3">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400/60 transition-all font-sans"
              />
            </div>

            {/* TOC Links List */}
            <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto custom-admin-scrollbar pr-1">
              {filteredToc.map((item) => {
                const isActive = activeToc === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} text-xs w-4 text-center shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stack Summary */}
            <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400 space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span>Architecture:</span>
                <span className="text-cyan-400 font-semibold">MERN + Vite</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage:</span>
                <span className="text-emerald-400 font-semibold">MongoDB / JSON</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assets:</span>
                <span className="text-purple-400 font-semibold">Cloudinary CDN</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (lg:col-span-8 xl:col-span-9): Scrollable Content Area
            ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          {/* SECTION 1: SYSTEM OVERVIEW */}
          <section id="overview" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-cubes" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">1. System Overview & Portfolio Architecture</h3>
                <p className="text-xs text-slate-400">
                  Understanding how content flows between the Admin CMS, Backend Storage, and Public Website.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              The Argon Portfolio CMS is an enterprise-grade portfolio management platform. As an administrator, you have real-time control over every public aspect of your developer brand without having to edit raw code or redeploy application files.
            </p>

            {/* Visual Workflow Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px]">1</span>
                  <span>Input & Draft</span>
                </div>
                <p className="text-xs text-slate-300">
                  Update projects, edit skills, adjust portrait positioning, or upload your new resume PDF.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px]">2</span>
                  <span>Live Simulation</span>
                </div>
                <p className="text-xs text-slate-300">
                  Preview card renders in real time right beside your inputs before persisting to production.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px]">3</span>
                  <span>Instant Publish</span>
                </div>
                <p className="text-xs text-slate-300">
                  One-click database commit triggers instant global sync across all live portfolio sections.
                </p>
              </div>
            </div>

            {/* Note Alert */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs leading-relaxed">
              <i className="fa-solid fa-circle-info text-base mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5 text-cyan-200">Live Client State Synchronization:</strong>
                All modifications made in this CMS synchronize through the high-performance unified state engine. When saved, changes are permanently written to MongoDB Atlas and cached for ultra-fast public visitor page loads.
              </div>
            </div>
          </section>

          {/* SECTION 2: MANAGING PROFILE */}
          <section id="profile" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-5 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-user-gear" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">2. Managing Profile & Personal Identity</h3>
                <p className="text-xs text-slate-400">
                  Configure your display name, monogram, contact details, academic credentials, and biography.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              The <strong className="text-white">Profile & Resume</strong> tab (located under Site Settings) contains 5 core content modules. As you edit any input, the <em>Live Rendering Simulation</em> card on the left reflects your changes immediately.
            </p>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                Form Fields & Specifications:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold">Display Name & Monogram</div>
                  <p className="text-slate-300">Your full legal/professional name and 2-4 character uppercase initials (e.g., <code className="bg-white/10 px-1 py-0.5 rounded text-white">AP</code>). Powers navbar brand badges and avatar icons.</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold">Email, Phone & Location</div>
                  <p className="text-slate-300">Public recruiter contact points. Displays in header quick contact, contact form card, and footer direct contact stack.</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold">Header Subtitle & Eyebrow</div>
                  <p className="text-slate-300">Short professional summary (e.g., <em>Full-Stack Developer · SISTec</em>) and eyebrow banner tag above main hero headline.</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold">Hero Headline & Description</div>
                  <p className="text-slate-300">The primary elevator pitch on the homepage. Keep headline punchy under 160 characters for maximum visual impact.</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold">Academic Background</div>
                  <p className="text-slate-300">College degree (e.g. <em>B.Tech CSE</em>), Institute (<em>SISTec, Bhopal</em>), CGPA (<code className="bg-white/10 px-1 py-0.5 rounded text-cyan-300">8.42</code>), Batch year, and Class XII board score.</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold">Social Profiles & Presence</div>
                  <p className="text-slate-300">Direct URLs for GitHub, LinkedIn, and Instagram. Connected URLs automatically enable vibrant brand badges in navigation and hero cards.</p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Executive Biography Paragraph Builder:
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Type your new narrative paragraph in the dashed biographical text area (max 300 characters).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Click <strong className="text-white">+ Add</strong> to append the paragraph to your active story list.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Click the trash icon on any paragraph to instantly remove outdated bio segments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                  <span>Click the docked <strong className="text-white">Publish Profile & Resume Changes</strong> button at the bottom to commit to the database.</span>
                </li>
              </ol>
            </div>

            {/* Warning Alert */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed">
              <i className="fa-solid fa-triangle-exclamation text-base mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5 text-amber-200">Required Personal Fields:</strong>
                Display Name, Initials, Email, Phone, and Current Location are required fields marked with a red asterisk (<span className="text-red-400">*</span>). The CMS will block saving if any required field is empty.
              </div>
            </div>
          </section>

          {/* SECTION 3: RESUME UPLOAD */}
          <section id="resume" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-5 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-file-pdf" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">3. Official Resume / CV Document Management</h3>
                <p className="text-xs text-slate-400">
                  Keep your curriculum vitae updated for hiring managers and recruiters.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Your resume PDF is linked directly from the top navigation bar <strong className="text-white">"Resume"</strong> button, the Hero CTA button, and the public Hire/Connect section. The CMS supports two seamless upload strategies:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                  <i className="fa-solid fa-cloud-arrow-up" />
                  <span>Option A: Direct Drag & Drop Upload</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Drag any official PDF file into the dropzone or click to open the file selector. The system validates the document, measures file size, uploads it to Cloudinary, and registers the verified URL.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                  <i className="fa-solid fa-link" />
                  <span>Option B: Direct Cloud URL Input</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Paste a direct link from Google Drive, Dropbox, AWS S3, or your GitHub repository. Ensure public view permissions are enabled on external cloud drives.
                </p>
              </div>
            </div>

            {/* File Constraints Alert */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-cyan-200">
                <i className="fa-solid fa-shield-halved text-cyan-400" />
                <span>Document Constraints & Specifications:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                <li><strong className="text-white">File Type:</strong> Official PDF document strictly (<code className="text-cyan-300 font-mono">.pdf</code> / <code className="text-cyan-300 font-mono">application/pdf</code>).</li>
                <li><strong className="text-white">Maximum File Size:</strong> 5MB maximum. Compressed vector PDFs recommended.</li>
                <li><strong className="text-white">Live Testing:</strong> After saving, click the <span className="text-cyan-300 font-semibold font-mono">"Preview Live Resume"</span> button in the top bar to verify external recruiter access.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 4: HERO PORTRAIT */}
          <section id="hero" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-5 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-image" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">4. Hero Portrait & Interactive Canvas Settings</h3>
                <p className="text-xs text-slate-400">
                  Control the 3D liquid particle canvas, focal position, and hero image framing.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Located under <strong className="text-white">Site Settings &gt; Hero Portrait</strong>, this tool allows you to calibrate the primary visual focus on the homepage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                <div className="font-mono text-cyan-300 font-bold">Image URL / Upload</div>
                <p className="text-slate-300">Input high-resolution PNG or WebP image with transparent or dark oceanic background.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
                <div className="font-mono text-cyan-300 font-bold">Focal Scale & Offset Sliders</div>
                <p className="text-slate-300">Fine-tune image scale (0.6x to 1.5x) and X/Y pixel offsets to align perfectly with the surrounding 3D spheres.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                <div className="font-mono text-cyan-300 font-bold">Particle Density (3 - 8)</div>
                <p className="text-slate-300">Adjust the number of floating 3D liquid droplets orbiting the portrait to optimize performance.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs">
              <i className="fa-solid fa-lightbulb text-base mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5 text-cyan-200">Temporary Stand-in Mode:</strong>
                If you are updating your professional portrait, enable the "Temporary Stand-in" toggle. The portfolio will display a stylized futuristic monogram canvas until your new high-res photography is uploaded.
              </div>
            </div>
          </section>

          {/* SECTION 5: PROJECTS MANAGEMENT */}
          <section id="projects" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-5 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-folder" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">5. Projects & Showcase Case Studies (3-Step Wizard)</h3>
                <p className="text-xs text-slate-400">
                  Creating, organizing, reordering, and publishing technical portfolio projects.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              The project creator in <strong className="text-white">Portfolio Content &gt; Projects</strong> is built as an intuitive 3-step wizard with visual percentage progress and drag-and-drop ordering.
            </p>

            {/* 3 Steps Breakdown */}
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px]">1</span>
                  <span>Step 1: Core Details & Categorization</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter the Project Title, URL slug (auto-generated from title), Category selector (e.g., <em>Full-Stack Web App, AI System, Mobile App</em>), Short Description, and Visibility Status (<code className="text-emerald-400 font-mono">Live</code> vs <code className="text-amber-400 font-mono">Draft</code>).
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px]">2</span>
                  <span>Step 2: Tech Stack, External Links & Completion Slider</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Add technologies (type name and press Enter or comma to create pills like React, Node.js, MongoDB), add your GitHub Repo URL, Live Production Demo URL, and adjust the animated <strong className="text-cyan-300">Completion % Slider</strong> (0% to 100%).
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px]">3</span>
                  <span>Step 3: Thumbnail Media & Key Technical Highlights</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload screenshot or input CDN thumbnail URL. Add bulleted key architectural highlights (e.g. <em>"Engineered Redis caching reducing latency by 45%"</em>). Click <strong className="text-white">"Publish Project Showcase"</strong> to finalize.
                </p>
              </div>
            </div>

            {/* Reordering Instructions */}
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider font-mono">
                Project Card Drag & Drop Reordering:
              </h4>
              <p>
                In the Projects list view, you can drag any project card by its handle icon (<i className="fa-solid fa-grip-vertical text-slate-400" />) and drop it into a new position to control the exact display order on the public homepage. You can also click the quick position chevrons (<span className="text-cyan-300 font-bold">▲</span> / <span className="text-cyan-300 font-bold">▼</span>) to shift positions step-by-step.
              </p>
            </div>
          </section>

          {/* SECTION 6: CERTIFICATES & CREDENTIALS */}
          <section id="certificates" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-certificate" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">6. Certificates & Credentials Management</h3>
                <p className="text-xs text-slate-400">
                  Manage verified technical certifications, issuing organizations, and badges.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Showcase verified credentials from AWS, HackerRank, Oracle, Coursera, or IBM. Features include:
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <li className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                <strong className="text-white block font-mono text-cyan-300">Lightbox Modal Preview:</strong>
                Visitors can click any certificate card to open high-resolution certificate imagery in an interactive zoomable modal.
              </li>
              <li className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                <strong className="text-white block font-mono text-cyan-300">Credential Verification Link:</strong>
                Recruiter-verifiable URL opens official certificate issuing authority in an external secure tab.
              </li>
              <li className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                <strong className="text-white block font-mono text-cyan-300">Skills Covered Tagging:</strong>
                Tag the specific technologies certified (e.g. <em>Java, Data Structures, AWS Cloud</em>).
              </li>
              <li className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                <strong className="text-white block font-mono text-cyan-300">Fast Deletion & Edit:</strong>
                Manage items with instant inline editing or safety-confirmed removal.
              </li>
            </ul>
          </section>

          {/* SECTION 7: TECHNICAL SKILLS */}
          <section id="skills" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-code" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">7. Technical Skills & Skill Categories</h3>
                <p className="text-xs text-slate-400">
                  Organize your tech stack into categorized buckets with custom brand colors and devicon logos.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Under <strong className="text-white">Portfolio Content &gt; Skills</strong>, you can add and organize programming languages, frameworks, developer tools, and databases.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                <div className="font-mono text-cyan-300 font-bold">Category Management:</div>
                <p>Create categories (e.g., <em>Frontend Development, Backend & APIs, Database & Cloud, Core Programming</em>) and assign a custom HEX accent color using the interactive color picker.</p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                <div className="font-mono text-cyan-300 font-bold">Automatic Devicon Logo Matching:</div>
                <p>When you type a skill name like <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">React</code>, <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Node.js</code>, <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Python</code>, or <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">MongoDB</code>, the system automatically detects the official logo from the Devicon library.</p>
              </div>
            </div>
          </section>

          {/* SECTION 8: ABOUT & MILESTONES */}
          <section id="journey" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-timeline" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">8. About & Milestones Career Timeline</h3>
                <p className="text-xs text-slate-400">
                  Document learning phases, academic milestones, and hackathon achievements.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Manage your engineering timeline in chronological stages (e.g. <em>Phase 1: Foundations in C/C++, Phase 2: MERN Stack & Full-Stack Projects, Phase 3: Distributed Systems & Cloud</em>).
            </p>
          </section>

          {/* SECTION 9: RECRUITER MESSAGES */}
          <section id="messages" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-envelope" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">9. Recruiter Messages Inbox & Contact Inquiries</h3>
                <p className="text-xs text-slate-400">
                  Review and organize inquiries submitted through the public Hire / Connect contact form.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Every recruiter submission made on <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 font-mono">/contact</code> is captured, validated, and persisted in your database.
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
              <li><strong className="text-white">Unread Badges:</strong> The sidebar displays an orange badge indicating new unread messages.</li>
              <li><strong className="text-white">Status Toggling:</strong> Mark messages as Read, Unread, or Archived.</li>
              <li><strong className="text-white">Sender Info:</strong> Inspect sender name, verified email, subject line, client IP, and UTC timestamp.</li>
            </ul>
          </section>

          {/* SECTION 10: SECURITY */}
          <section id="security" className="glass-card-admin rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-lock" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">10. Security & Administrative Credentials</h3>
                <p className="text-xs text-slate-400">
                  Managing administrative access, session tokens, and security best practices.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Under <strong className="text-white">Site Settings &gt; Security</strong>, you can change your administrator password. The system uses salted SHA-256 password hashing and cryptographically signed session cookies.
            </p>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
              <i className="fa-solid fa-shield-cat text-base mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5 text-amber-200">Terminal Recovery Command:</strong>
                If you ever forget your administrator password, you can reset it locally from the repository root terminal by executing:
                <div className="mt-2 flex items-center justify-between gap-2 bg-black/60 rounded-lg p-2 font-mono text-[11px] text-cyan-300 border border-white/10">
                  <code>npm run setup:admin</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('npm run setup:admin', 'Command')}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminUserGuide;
