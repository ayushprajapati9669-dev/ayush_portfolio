import React from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function CertificateCard({ cert }) {
  const { openCertificateLightbox } = usePortfolio();
  const imgSrc = cert.imageUrl || '/images/apna-college-delta-certificate.jpg';

  return (
    <article className="scroll-reveal glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-5">
      <div className="space-y-4">
        <div onClick={() => openCertificateLightbox(cert.id)} className="cursor-pointer">
          <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-2xl border border-white/15 bg-obsidian group">
            <img
              src={imgSrc}
              alt={cert.title}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="rounded-full bg-cyanglow px-3.5 py-1 font-mono text-xs font-bold text-obsidian shadow-lg">
                Click to Open Full Certificate
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs font-semibold text-cyanglow">{cert.issuer}</p>
            <span className="rounded-full border border-white/10 bg-obsidian px-2.5 py-0.5 font-mono text-[11px] text-amberwarm">
              {cert.issueDate}
            </span>
          </div>
          <h3 className="font-display text-xl font-extrabold text-white">{cert.title}</h3>
          {cert.credentialId && (
            <p className="font-mono text-[11px] text-stonewarm">
              Certificate ID: <span className="text-alabaster">{cert.credentialId}</span>
            </p>
          )}
          {cert.skillsCovered && (
            <p className="text-xs text-stonewarm leading-relaxed">Skills: {cert.skillsCovered}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t hairline-border pt-4">
        <button
          type="button"
          onClick={() => openCertificateLightbox(cert.id)}
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-cyanglow px-5 py-2.5 font-mono text-xs font-bold text-obsidian shadow-lg shadow-cyanglow/20 hover:opacity-90 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>View Certificate</span>
        </button>

        {cert.credentialUrl ? (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-obsidian px-4 py-2 font-mono text-xs text-alabaster hover:border-vermilion"
          >
            <span>Verify</span>
            <span>↗</span>
          </a>
        ) : (
          <span className="font-mono text-[11px] text-sage">✓ Verified Credential</span>
        )}
      </div>
    </article>
  );
}
