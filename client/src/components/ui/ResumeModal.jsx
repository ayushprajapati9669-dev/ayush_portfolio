import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function ResumeModal() {
  const { appState, resumeModalOpen, closeResumeModal, downloadOrPrintResume } = usePortfolio();
  const cardRef = useRef(null);
  const [viewFormat, setViewFormat] = useState('pdf'); // 'pdf' | 'image'

  const p = appState.profile || {};
  const activeResume = (appState.resumes || []).find((r) => r.isActive) || (appState.resumes || [])[0];
  const pdfUrl = activeResume?.fileUrl || p.resumeUrl || '/images/Ayush_Prajapati_Resume.pdf';
  const previewImg = p.resumePreviewUrl || '/images/ayush-resume-preview.jpg';

  // GSAP entrance animation on open
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
        playTick();
        closeResumeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resumeModalOpen, closeResumeModal]);

  if (!resumeModalOpen) return null;

  const handleDownload = () => {
    playTick();
    if (downloadOrPrintResume) {
      downloadOrPrintResume();
    } else {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${(p.name || 'Ayush_Prajapati').replace(/\s+/g, '_')}_Resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    playTick();
    closeResumeModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={cardRef}
        className="w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border border-cyan-400/30 bg-[#080d19] shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
      >
        {/* Header matching Image 2 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#060a14] px-6 py-4.5 sm:px-8">
          <div className="space-y-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#06b6d4]">
              CURRICULUM VITAE
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {p.name || 'Ayush Prajapati'} — Resume
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* View Format Selector (PDF / Image Preview) */}
            <div className="hidden sm:inline-flex items-center rounded-xl border border-white/10 bg-black/40 p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setViewFormat('pdf');
                }}
                className={`rounded-lg px-3 py-1 transition-colors ${
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
                  playTick();
                  setViewFormat('image');
                }}
                className={`rounded-lg px-3 py-1 transition-colors ${
                  viewFormat === 'image'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Image Preview
              </button>
            </div>

            {/* Download PDF button (gradient) */}
            <button
              type="button"
              onClick={handleDownload}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#10b981] px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-400/20 hover:opacity-95 transition-all active:scale-95"
            >
              <i className="fa-solid fa-download text-xs" />
              <span>Download PDF</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs font-semibold text-white hover:bg-white/15 hover:border-white/30 transition-all active:scale-95"
            >
              <i className="fa-solid fa-xmark text-xs" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Modal Body - Document Viewing Area matching Image 2 */}
        <div className="p-4 sm:p-6 bg-[#040711] overflow-auto flex-1 flex flex-col items-center justify-center">
          <div className="w-full h-full min-h-[68vh] rounded-2xl border border-white/10 bg-white overflow-hidden shadow-2xl relative flex items-center justify-center">
            {viewFormat === 'pdf' ? (
              <object
                data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-[74vh] rounded-xl border-none"
              >
                {/* Fallback if browser doesn't natively render pdf in object */}
                <iframe
                  src={pdfUrl}
                  title="Ayush Prajapati Resume PDF"
                  className="w-full h-[74vh] rounded-xl border-none"
                >
                  <div className="p-8 text-center text-slate-700 space-y-3 font-sans">
                    <p className="font-bold text-lg">Unable to display PDF preview directly.</p>
                    <p className="text-sm text-slate-500">You can download or switch to high-resolution image preview.</p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setViewFormat('image')}
                        className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white"
                      >
                        Switch to Image Preview
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </iframe>
              </object>
            ) : (
              <div className="w-full h-full overflow-auto p-4 flex items-center justify-center bg-slate-900">
                <img
                  src={previewImg}
                  alt={`${p.name || 'Ayush Prajapati'} Resume`}
                  className="max-h-[72vh] w-auto rounded-lg object-contain shadow-xl border border-white/10"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#060a14] px-6 py-3 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400">✉ {p.email || 'ayushprajapati9669@gmail.com'}</span>
            <span>•</span>
            <span>☎ {p.phone || '(+91) 9669802554'}</span>
            <span>•</span>
            <span>CGPA: {p.education?.cgpa || '8.42 (2026)'}</span>
          </div>
          <div className="text-slate-500">
            Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">ESC</kbd> or click outside to close
          </div>
        </div>
      </div>
    </div>
  );
}

