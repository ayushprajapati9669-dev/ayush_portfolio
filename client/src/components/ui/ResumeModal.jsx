import React from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SocialIconButtons } from '../common/TechLogos';

export function ResumeModal() {
  const { appState, resumeModalOpen, closeResumeModal, downloadOrPrintResume } = usePortfolio();
  if (!resumeModalOpen) return null;

  const p = appState.profile || {};
  const previewImg = p.resumePreviewUrl || '/images/ayush-resume-preview.jpg';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-white/15 bg-charcoal shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline-border bg-obsidian px-6 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-cyanglow">
              CURRICULUM VITAE · RESUME
            </p>
            <h3 className="font-display text-xl font-bold text-alabaster">
              {p.name} — Official Resume ({p.education?.cgpa || 'CSE 2026'})
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={downloadOrPrintResume}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-cyanglow px-4 py-2 text-xs font-bold text-obsidian hover:opacity-90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download / Print PDF</span>
            </button>
            <button
              type="button"
              onClick={closeResumeModal}
              className="focus-ring rounded-full border border-white/15 bg-charcoal px-3.5 py-2 font-mono text-xs text-stonewarm hover:text-alabaster"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
          <div className="rounded-2xl border border-cyanglow/35 bg-obsidian p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm font-bold text-white">
                {p.name} · {p.email || 'ayushprajapati9669@gmail.com'} · {p.phone || '(+91) 9669802554'}
              </p>
              <p className="font-mono text-xs text-cyanglow mt-0.5">
                {p.education?.college} — {p.education?.cgpa || 'CGPA: 8.42 | (2026)'}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadOrPrintResume}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-cyanglow px-5 py-2.5 font-mono text-xs font-bold text-obsidian shadow-lg shadow-cyanglow/20 hover:opacity-90"
            >
              <span>↓ Download Resume PDF</span>
            </button>
          </div>

          {previewImg && (
            <div className="rounded-2xl border border-white/15 bg-white p-2 sm:p-4 shadow-2xl overflow-hidden">
              <img
                src={previewImg}
                alt={`${p.name} Official Resume`}
                className="w-full h-auto rounded-lg object-contain mx-auto max-h-[72vh]"
              />
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-obsidian p-6 space-y-5">
            <div className="border-b hairline-border pb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h4 className="font-display text-2xl font-extrabold text-white">{p.name}</h4>
                <p className="font-mono text-xs text-cyanglow mt-1">
                  {p.email || 'ayushprajapati9669@gmail.com'} | {p.phone || '(+91) 9669802554'}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <SocialIconButtons socialLinks={p.socialLinks} sizeClass="h-9 w-9" />
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-cyanglow">EDUCATION</h5>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-charcoal p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-white">CSE | SISTec, Bhopal</span>
                    <span className="rounded-full bg-sage/15 px-2.5 py-0.5 font-mono text-xs font-bold text-sage">
                      CGPA: 8.42 | (2026)
                    </span>
                  </div>
                  <p className="text-xs text-stonewarm mt-1">{p.education?.degree}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-charcoal p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-white">XII (MP Board)</span>
                    <span className="rounded-full bg-cyanglow/15 px-2.5 py-0.5 font-mono text-xs font-bold text-cyanglow">
                      83.5% | 2022
                    </span>
                  </div>
                  <p className="text-xs text-stonewarm mt-1">Kasturba Vidhya Mandir, Jamani, Madhya Pradesh</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-cyanglow">SKILLS</h5>
              <div className="rounded-xl border border-white/10 bg-charcoal p-4 space-y-1.5 text-xs text-alabaster">
                <p>❖ <strong>Languages:</strong> C, Java, JavaScript, Python</p>
                <p>❖ <strong>Web Technologies:</strong> HTML, CSS, Bootstrap, React.js, Node.js, Express.js</p>
                <p>❖ <strong>Databases & Tools:</strong> MySQL, MongoDB, Git, GitHub, Cloudinary</p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-cyanglow">ACADEMIC & LIVE PROJECTS</h5>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(p.academicProjects || []).map((ap, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-charcoal p-4 space-y-1.5">
                    <p className="font-display text-sm font-bold text-white">{ap.title}</p>
                    <p className="font-mono text-[10px] text-vermilion">{ap.stack}</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-stonewarm">
                      {(ap.points || []).map((pt, j) => (
                        <li key={j}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-cyanglow">ACHIEVEMENTS / HOBBIES</h5>
              <div className="rounded-xl border border-white/10 bg-charcoal p-4 text-xs text-alabaster space-y-1">
                {(p.achievements || ['Won a website-making competition at college.']).map((ach, i) => (
                  <p key={i}>● {ach}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
