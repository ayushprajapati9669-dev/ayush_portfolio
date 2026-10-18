import React from 'react';
import { TechLogo, SocialBrandIcon } from '../common/TechLogos';

export function ProjectCard({ proj, indexNum, isSelected, onSelect }) {
  const imgSrc = proj.thumbnailUrl || '/images/airbnb-clone-preview.jpg';
  const githubHref = proj.githubUrl || 'https://github.com/ayushprajapati9669-dev';
  const liveHref = proj.liveDemoUrl || 'https://airbnbclone2-8519.onrender.com';

  return (
    <article
      onClick={() => onSelect && onSelect(proj.id)}
      className={`group scroll-reveal cursor-pointer glass-card glass-card-hover rounded-3xl p-5 sm:p-7 flex flex-col justify-between space-y-6 ${
        isSelected ? 'border-cyanglow ring-2 ring-cyanglow/30' : ''
      }`}
    >
      <div className="space-y-5">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-obsidian group-hover:border-cyanglow/40 transition-colors">
          <img
            src={imgSrc}
            alt={proj.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent" />
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
            <span className="rounded-full bg-obsidian/85 backdrop-blur-md border border-white/15 px-3.5 py-1 font-mono text-[11px] font-bold text-cyanglow">
              {proj.category}
            </span>
            {proj.liveDemoUrl && /^https?:\/\//i.test(proj.liveDemoUrl) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/20 backdrop-blur-md border border-sage/40 px-3 py-1 font-mono text-[11px] font-bold text-sage">
                <span className="h-2 w-2 rounded-full bg-sage animate-pulse" />
                Live Deployed
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-vermilion font-semibold">PROJECT 0{indexNum}</span>
            <span className="text-stonewarm text-[11px]">
              {isSelected ? '● Quick Actions Highlighted' : 'Click Card or Launch Live Demo'}
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white group-hover:text-cyanglow transition-colors">
            {proj.title}
          </h3>
          <p className="text-sm leading-relaxed text-stonewarm">{proj.shortDescription}</p>
        </div>
      </div>

      <div className="space-y-5 pt-2">
        <div className="flex flex-wrap gap-2">
          {(proj.technologies || []).map((t, idx) => (
            <span
              key={`${t}-${idx}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-obsidian/90 px-3 py-1.5 text-xs font-semibold text-alabaster"
            >
              <TechLogo name={t} className="h-4 w-4" />
              <span>{t}</span>
            </span>
          ))}
        </div>

        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-t hairline-border pt-4 ${
            isSelected ? 'bg-obsidian/90 -mx-2 px-4 py-3.5 rounded-2xl border border-cyanglow/40' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-vermilion px-6 py-3 text-xs font-bold text-obsidian shadow-lg shadow-vermilion/25 transition-transform hover:-translate-y-0.5 hover:opacity-95"
            >
              <span>Live Demo</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <a
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/15 bg-obsidian px-5 py-3 text-xs font-bold text-alabaster transition-all hover:-translate-y-0.5 hover:border-cyanglow hover:text-cyanglow"
            >
              <SocialBrandIcon platform="github" className="h-4 w-4" />
              <span>Code</span>
            </a>
          </div>

          <span className="font-mono text-[11px] text-cyanglow hidden sm:inline">↗ Opens Live App</span>
        </div>
      </div>
    </article>
  );
}
