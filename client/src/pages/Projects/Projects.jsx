import React, { useState } from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { CertificateCard } from '../../components/projects/CertificateCard';

export function ProjectsPage({ viewMode = 'projects' }) {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);

  if (viewMode === 'certificates') {
    const certs = appState.certificates || [];
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 pt-12 space-y-10">
        <div className="border-b hairline-border pb-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyanglow">
            {ui.homeCertsEyebrow || '04 · VERIFIED CREDENTIALS'}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-alabaster">
            {ui.homeCertsHeading || 'Certifications & Achievements'}
          </h1>
          <p className="mt-2 text-sm text-stonewarm">
            Click on any certificate card or "View Certificate" to inspect the full-resolution credential.
          </p>
        </div>

        {certs.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-4">
            <p className="font-display text-xl font-bold text-alabaster">No certificates published yet</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-8 ${certs.length === 1 ? 'max-w-2xl' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {certs.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const publishedProjects = (appState.projects || [])
    .filter((p) => p.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const categories = ['All', ...Array.from(new Set(publishedProjects.map((p) => p.category)))];
  const filtered = publishedProjects.filter((proj) => {
    const matchesCat = selectedCategory === 'All' || proj.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      proj.title.toLowerCase().includes(q) ||
      proj.shortDescription.toLowerCase().includes(q) ||
      (proj.technologies || []).some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 pt-12 space-y-10">
      <div className="border-b hairline-border pb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">
            {ui.homeProjectsEyebrow || '02 · LIVE DEPLOYED PROJECTS'}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-alabaster">
            {ui.homeProjectsHeading || 'Featured Full-Stack Applications'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`focus-ring rounded-full px-4 py-2 font-mono text-xs transition-colors ${
                selectedCategory === cat
                  ? 'bg-vermilion text-obsidian font-bold'
                  : 'border border-white/15 bg-charcoal text-alabaster hover:border-vermilion'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <label htmlFor="project-search-input" className="sr-only">Search projects</label>
          <input
            id="project-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project title or stack (e.g. React, MongoDB)..."
            className="focus-ring w-full rounded-full border border-white/15 bg-charcoal px-5 py-2.5 text-sm text-alabaster placeholder-stonewarm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4">
          <p className="font-display text-xl font-bold text-alabaster">No matching projects found</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="focus-ring rounded-full bg-vermilion px-5 py-2.5 text-xs font-bold text-obsidian"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-8 ${filtered.length === 1 ? 'max-w-3xl' : 'lg:grid-cols-2'}`}>
          {filtered.map((proj, idx) => (
            <ProjectCard
              key={proj.id}
              proj={proj}
              indexNum={idx + 1}
              isSelected={highlightedId === proj.id}
              onSelect={setHighlightedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
