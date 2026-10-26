import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

const ROLE_PRESETS = {
  fullstack: {
    id: 'fullstack',
    name: 'Full-Stack MERN Focus',
    badge: 'Option A • End-to-End',
    headline: 'Full-Stack MERN & Systems Engineer',
    summary:
      'Full-Stack Developer specialized in architecting high-throughput React/Node.js web applications, resilient distributed systems, and real-time state synchronization. Proven track record delivering production platforms with sub-50ms query latency, 98+ Lighthouse scores, and 350+ LeetCode algorithmic solutions.',
    skills: {
      languages: ['JavaScript (ES6+)', 'TypeScript', 'Java', 'C++', 'SQL'],
      frontend: ['React 18/19', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'GSAP', 'HTML5/CSS3'],
      backend: ['Node.js', 'Express.js', 'REST APIs', 'GraphQL', 'WebSockets', 'BullMQ'],
      databases: ['MongoDB Atlas', 'Redis Cluster', 'PostgreSQL', 'Mongoose'],
      cloudDevops: ['Docker', 'AWS (S3, EC2)', 'Git/GitHub Actions', 'Postman', 'Vercel']
    },
    highlights: [
      'Architected Wanderlust Airbnb platform with multi-document ACID transactions, eliminating concurrent booking collisions.',
      'Constructed distributed microservice APIs with Redis caching layer, reducing primary database load by >60%.',
      'Developed responsive, accessible web interfaces adhering to WCAG 2.1 standards with 60FPS fluid micro-animations.'
    ]
  },
  backend: {
    id: 'backend',
    name: 'Backend & Systems Focus',
    badge: 'Option B • High-Concurrency',
    headline: 'Backend & Distributed Systems Engineer',
    summary:
      'Backend Engineer with deep focus on scalable microservices, low-latency database indexing, and distributed in-memory caching. Proficient in Node.js event-driven runtimes, Redis data structures, MongoDB replica sets, and strict rate-limiting architectures.',
    skills: {
      languages: ['Node.js / JavaScript', 'Java', 'C++', 'SQL', 'Bash / Shell'],
      backend: ['Node.js Microservices', 'Express.js', 'RESTful API Design', 'WebSockets', 'Reverse Proxy (Nginx)'],
      databases: ['MongoDB (Compound B-tree Indexes, 2PC)', 'Redis (P99 < 1.4ms, Pub/Sub)', 'PostgreSQL', 'ACID Transactions'],
      systems: ['System Design (HLD/LLD)', 'Concurrency Control', 'Distributed Locks', 'Sliding-Window Rate Limiting'],
      cloudDevops: ['Docker Containers', 'AWS (EC2, S3, CloudFront)', 'CI/CD Pipelines', 'Linux Environment']
    },
    highlights: [
      'Engineered compound 2dsphere + pricing indexes in MongoDB, dropping aggregation search latency from 850ms to 45ms.',
      'Implemented sliding-window IP rate-limiting and HMAC request authentication to defeat volumetric layer-7 attacks.',
      'Solved 350+ complex algorithmic challenges on LeetCode with 71.4% acceptance rate and Top 12% global ranking.'
    ]
  },
  frontend: {
    id: 'frontend',
    name: 'Frontend & UI/UX Focus',
    badge: 'Option C • Design & Motion',
    headline: 'Frontend & UI/UX Motion Engineer',
    summary:
      'Frontend Specialist combining computational rigor with state-of-the-art visual aesthetics. Master of React, Tailwind CSS token systems, GSAP physics animations, Web Audio API synthesis, and zero-layout-shift performance engineering.',
    skills: {
      languages: ['JavaScript (Modern ESNext)', 'TypeScript', 'HTML5 Semantic', 'CSS3 Modern Tokens'],
      frontend: ['React 18/19', 'Next.js', 'Tailwind CSS', 'GSAP 3D & ScrollTrigger', 'Canvas / WebGL'],
      interaction: ['Web Audio API (Mechanical Synthesis)', 'Keyboard Hotkey Drawers', 'Framer Motion', 'Responsive Grid'],
      tooling: ['Vite', 'Webpack', 'PostCSS', 'Chrome DevTools Profiler', 'Lighthouse 98+'],
      testing: ['Accessibility (WCAG 2.1)', 'Cross-Browser Compatibility', 'Fluid Typography Systems']
    },
    highlights: [
      'Built retro Developer CLI terminal drawer and Web Audio mechanical keyboard synthesizer without external audio bloat.',
      'Engineered dynamic interactive System Architecture Topology and Live API Console inside case study views.',
      'Achieved 98+ Google Lighthouse scores across Performance, Accessibility, Best Practices, and SEO.'
    ]
  }
};

export function ResumeModal() {
  const { appState, resumeModalOpen, closeResumeModal } = usePortfolio();
  const cardRef = useRef(null);
  const printAreaRef = useRef(null);

  const [activeRole, setActiveRole] = useState('fullstack');
  const [viewFormat, setViewFormat] = useState('tailored'); // 'tailored' | 'pdf' | 'image'

  const p = appState.profile || {};
  const activeResume = (appState.resumes || []).find((r) => r.isActive) || (appState.resumes || [])[0];
  const pdfUrl = activeResume?.fileUrl || p.resumeUrl || '/images/Ayush_Prajapati_Resume.pdf';
  const previewImg = p.resumePreviewUrl || '/images/ayush-resume-preview.jpg';

  const roleData = ROLE_PRESETS[activeRole] || ROLE_PRESETS.fullstack;

  // Entrance animation
  useEffect(() => {
    if (!resumeModalOpen) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.94, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.15)' }
      );
    }
  }, [resumeModalOpen]);

  // Escape key listener to close
  useEffect(() => {
    if (!resumeModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        playTick('click');
        closeResumeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resumeModalOpen, closeResumeModal]);

  if (!resumeModalOpen) return null;

  const handleDownloadTailoredPdf = () => {
    playTick('click');
    // Trigger telemetry event
    fetch('/api/public/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'resume_download',
        path: `/resume/${activeRole}`,
        title: `Role-Tailored Resume: ${roleData.name}`
      })
    }).catch(() => {});

    // Print tailored view
    window.print();
  };

  const handleClose = () => {
    playTick('click');
    closeResumeModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={cardRef}
        className="w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border border-cyan-400/30 bg-[#080d19] shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#060a14] px-6 py-4 sm:px-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#06b6d4]">
                ROLE-TAILORED RESUME GENERATOR
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                ATS 98%
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {p.name || 'Ayush Prajapati'} — Curriculum Vitae
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="hidden sm:inline-flex items-center rounded-xl border border-white/10 bg-black/40 p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  playTick('click');
                  setViewFormat('tailored');
                }}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  viewFormat === 'tailored'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tailored Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  playTick('click');
                  setViewFormat('pdf');
                }}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  viewFormat === 'pdf'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF View
              </button>
              <button
                type="button"
                onClick={() => {
                  playTick('click');
                  setViewFormat('image');
                }}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  viewFormat === 'image'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Image
              </button>
            </div>

            {/* Print / Download Button */}
            <button
              type="button"
              onClick={handleDownloadTailoredPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-sky-400/20 hover:opacity-95 transition-all active:scale-95"
            >
              <i className="fa-solid fa-download text-xs" />
              <span>Download / Print ATS PDF</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs font-semibold text-white hover:bg-white/15 hover:border-white/30 transition-all active:scale-95"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        </div>

        {/* Role Selection Tabs Bar (Option A, B, C) */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#0a101d] border-b border-white/5 overflow-x-auto">
          <span className="text-[11px] font-mono text-white/40 shrink-0 mr-1">Target Role:</span>
          {Object.values(ROLE_PRESETS).map((preset) => {
            const isSelected = activeRole === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  playTick('click');
                  setActiveRole(preset.id);
                  setViewFormat('tailored');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] opacity-60">({preset.badge.split('•')[0].trim()})</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 bg-[#040711] overflow-y-auto flex-1 flex flex-col items-center">
          {viewFormat === 'tailored' ? (
            /* ATS Tailored Printable Document */
            <div
              ref={printAreaRef}
              className="w-full max-w-3xl bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-2xl font-sans text-xs leading-normal select-text"
            >
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {p.name || 'Ayush Prajapati'}
                </h1>
                <p className="text-xs font-bold text-sky-800 uppercase tracking-widest mt-0.5">
                  {roleData.headline}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600 mt-2 font-mono">
                  <span>{p.email || 'ayushprajapati9669@gmail.com'}</span>
                  <span>•</span>
                  <span>{p.phone || '+91 9669802554'}</span>
                  <span>•</span>
                  <a href="https://linkedin.com/in/ayush-prajapati-04b3a428b" className="text-sky-700 underline">
                    LinkedIn
                  </a>
                  <span>•</span>
                  <a href="https://github.com/ayushprajapati9669-dev" className="text-sky-700 underline">
                    GitHub
                  </a>
                  <span>•</span>
                  <a href="https://leetcode.com/u/ayush7162/" className="text-sky-700 underline">
                    LeetCode (350+)
                  </a>
                </div>
              </div>

              {/* Summary Section */}
              <div className="mt-4">
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                  Professional Summary
                </h2>
                <p className="text-slate-700 leading-relaxed text-[11px]">{roleData.summary}</p>
              </div>

              {/* Technical Skills Section */}
              <div className="mt-4">
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                  Technical Competencies
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  {Object.entries(roleData.skills).map(([cat, list]) => (
                    <div key={cat} className="flex">
                      <span className="font-bold text-slate-900 capitalize mr-1.5 min-w-[85px]">
                        {cat.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span className="text-slate-700">{list.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Projects & Case Studies */}
              <div className="mt-4">
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-300 pb-0.5 mb-2">
                  Featured Engineering Projects
                </h2>

                {/* Project 1 */}
                <div className="mb-3">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-[11px]">
                    <span>WANDERLUST — DISTRIBUTED VACATION RENTAL PLATFORM</span>
                    <span className="font-mono text-[10px] text-slate-500">Node.js, Express, MongoDB, Redis, React</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-700 text-[11px] mt-1 space-y-0.5 leading-snug">
                    <li>Engineered geo-spatial accommodation search pipeline with compound B-tree 2dsphere indexes, achieving sub-45ms P95 query latency.</li>
                    <li>Integrated in-memory Redis cluster for session rate-limiting and query caching, dropping primary database load by 64%.</li>
                    <li>Designed ACID multi-document reservation transactions to eliminate concurrent booking collisions under high load.</li>
                  </ul>
                </div>

                {/* Project 2 */}
                <div className="mb-3">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-[11px]">
                    <span>AUTONOMOUS MULTI-AGENT WORKSPACE & AI INTERVIEW SUITE</span>
                    <span className="font-mono text-[10px] text-slate-500">React 19, Node.js, WebSockets, BullMQ</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-700 text-[11px] mt-1 space-y-0.5 leading-snug">
                    <li>Constructed real-time conversational agent pipeline using WebSocket streaming and semantic RAG retrieval.</li>
                    <li>Orchestrated asynchronous background job queue with BullMQ for media compression and automated report generation.</li>
                  </ul>
                </div>
              </div>

              {/* Key Role Highlights */}
              <div className="mt-4">
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                  Target Role Highlights & Impact
                </h2>
                <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-0.5">
                  {roleData.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              {/* Education & Achievements */}
              <div className="mt-4">
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                  Education & Algorithmic Rigor
                </h2>
                <div className="flex justify-between text-[11px]">
                  <div>
                    <strong className="text-slate-900">B.Tech in Computer Science & Engineering</strong>
                    <div className="text-slate-600">SISTec (Sagar Institute of Science and Technology), Bhopal</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">CGPA: 8.42</span>
                    <div className="font-mono text-[10px] text-slate-500">Graduating 2026</div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-700">
                  <strong>LeetCode Problem Solving:</strong> 350+ solved challenges (142 Easy, 182 Medium, 32 Hard), 71.4% acceptance rate, Contest Rating 1,742+ (Top 12% globally).
                </div>
              </div>
            </div>
          ) : viewFormat === 'pdf' ? (
            <div className="w-full h-full min-h-[68vh] rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl relative flex items-center justify-center">
              <iframe
                src={pdfUrl}
                title="Ayush Prajapati Resume PDF"
                className="w-full h-[74vh] rounded-xl border-none"
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-auto p-4 flex items-center justify-center bg-slate-900 rounded-2xl">
              <img
                src={previewImg}
                alt={`${p.name || 'Ayush Prajapati'} Resume`}
                className="max-h-[72vh] w-auto rounded-lg object-contain shadow-xl border border-white/10"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#060a14] px-6 py-3 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400">✉ {p.email || 'ayushprajapati9669@gmail.com'}</span>
            <span>•</span>
            <span>☎ {p.phone || '+91 9669802554'}</span>
            <span>•</span>
            <span>Selected Role: <strong className="text-white">{roleData.name}</strong></span>
          </div>
          <div className="text-slate-500">
            Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
