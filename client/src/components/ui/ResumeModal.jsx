import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function ResumeModal() {
  const { appState, resumeModalOpen, closeResumeModal } = usePortfolio();
  const cardRef = useRef(null);

  const p = appState.profile || {};
  const activeResume = (appState.resumes || []).find((r) => r.isActive) || (appState.resumes || [])[0];
  const pdfUrl = activeResume?.fileUrl || p.resumeUrl || '/images/Ayush_Prajapati_Resume.pdf';
  const displayName = p.displayName || p.name || 'Ayush Prajapati';

  // Entrance animation
  useEffect(() => {
    if (!resumeModalOpen) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
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

  const handleClose = () => {
    playTick('click');
    closeResumeModal();
  };

  const handleDownload = () => {
    playTick('click');
    // Telemetry tracking
    fetch('/api/public/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'resume_download',
        path: pdfUrl,
        title: `${displayName} — Resume`
      })
    }).catch(() => {});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={cardRef}
        className="w-full max-w-[920px] h-[90vh] flex flex-col rounded-[20px] border border-cyan-500/30 bg-[#0b1120] shadow-[0_40px_120px_-20px_rgba(0,0,0,1),0_0_80px_rgba(6,182,212,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30 z-10 flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[#06b6d4] font-mono text-[11px] font-bold tracking-[1px] uppercase">
              Curriculum Vitae
            </span>
            <h2 className="text-white font-['Space_Grotesk',sans-serif] text-xl font-semibold tracking-tight">
              {displayName} — Resume
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Download PDF button */}
            <a
              href={pdfUrl}
              download="Ayush_Prajapati_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#10b981] text-black font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-[0_4px_15px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(6,182,212,0.5)] transition-all active:scale-95 no-underline"
            >
              <i className="fa-solid fa-download text-xs" />
              <span>Download PDF</span>
            </a>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg hover:bg-white/15 transition-all active:scale-95 outline-none"
            >
              <i className="fa-solid fa-xmark text-xs" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-[#1e1e24] relative flex flex-col min-h-0">
          {/* Desktop Iframe Viewer */}
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-none hidden md:block bg-white"
            title="Resume PDF"
          />

          {/* Mobile Fallback */}
          <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center bg-[#0b1120] text-center p-8 z-5">
            <i className="fa-regular fa-file-pdf text-5xl text-[#06b6d4] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Resume Preview</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              Mobile browsers do not support direct PDF embedding. Please click the button below to download or view the full resume.
            </p>
            <a
              href={pdfUrl}
              download="Ayush_Prajapati_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06b6d4] to-[#10b981] text-black font-bold text-sm px-6 py-3 rounded-lg shadow-[0_4px_15px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 transition-all no-underline"
            >
              <i className="fa-solid fa-download text-sm" />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
