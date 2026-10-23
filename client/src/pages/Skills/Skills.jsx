import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { InteractiveSkillsWidget } from '../../components/ui/InteractiveSkillsWidget';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SEO } from '../../components/SEO';
import { personSchema } from '../../utils/seo';

export function SkillsPage() {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};
  const containerRef = useRef(null);

  const allSkillNames = (appState.skills || []).flatMap((c) => (c.items || []).map((i) => i.name)).filter(Boolean);

  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.skills-page-header > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="w-full min-h-screen pt-28 pb-20" ref={containerRef}>
      <SEO
        title="Technical Skills & Stack"
        description="Comprehensive matrix of Ayush Prajapati's software competencies: React, Node.js, Express, MongoDB, Data Structures, Java, C, Python, SQL, REST APIs, and DevOps tools."
        schema={personSchema(appState.profile, { knowsAbout: allSkillNames.length > 0 ? allSkillNames : undefined })}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="skills-page-header text-center max-w-3xl mx-auto mb-10 space-y-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyanglow">
            {ui.homeSkillsEyebrow || '03 · Technical Capabilities'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-alabaster tracking-tight">
            Skills & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanglow via-teal-300 to-sage">Tech Stack</span>
          </h1>
          <p className="text-sm sm:text-base text-stonewarm leading-relaxed">
            Full-stack proficiency across languages, modern frontend systems, backend APIs, distributed databases, and engineering developer tools.
          </p>
        </div>

        <InteractiveSkillsWidget isStandalonePage={true} />
      </div>
    </main>
  );
}

