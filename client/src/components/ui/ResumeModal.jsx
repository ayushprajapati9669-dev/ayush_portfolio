import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
        { scale: 0.94, opacity: 0, y: 16 },
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md"
      style={{ zIndex: 1000000 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={cardRef}
        className="w-full max-w-[960px] h-[88vh] max-h-[920px] flex flex-col rounded-[20px] border border-[#d4af37]/30 bg-[#0a0a0c] shadow-[0_40px_120px_-20px_rgba(0,0,0,1)] overflow-hidden"
        style={{ zIndex: 1000001 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080808]/95 z-10 flex-wrap gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[#d4af37] font-mono text-[11.5px] font-semibold tracking-[0.16em] uppercase">
              Curriculum Vitae • Verified Profile
            </span>
            <h2 className="text-white font-['Cormorant_Garamond',Georgia,serif] text-2xl sm:text-3xl font-normal tracking-tight">
              {displayName} <span className="text-[#d4af37]">.</span>
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
              className="inline-flex items-center gap-2 bg-[#d4af37] text-black font-semibold text-xs sm:text-sm px-4 py-2 rounded-full border border-[#d4af37] hover:bg-[#e8c84a] transition-all active:scale-95 no-underline shadow-[0_2px_12px_rgba(212,175,55,0.3)]"
            >
              <i className="fa-solid fa-download text-xs" />
              <span>Download PDF</span>
            </a>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 bg-white/5 border border-white/15 text-white/90 hover:text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-full hover:bg-white/10 transition-all active:scale-95 outline-none cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-xs" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-[#121216] relative flex flex-col min-h-0">
          {/* Desktop Iframe Viewer */}
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-none hidden md:block bg-white"
            title="Resume PDF"
          />

          {/* Mobile Fallback */}
          <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0c] text-center p-8 z-5">
            <i className="fa-regular fa-file-pdf text-5xl text-[#d4af37] mb-4" />
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
              className="inline-flex items-center gap-2 bg-[#d4af37] text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#e8c84a] transition-all no-underline shadow-[0_2px_15px_rgba(212,175,55,0.3)]"
            >
              <i className="fa-solid fa-download text-sm" />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
