import React, { useRef } from 'react';
import { InteractiveSkillsWidget } from '../../components/ui/InteractiveSkillsWidget';
import { ScrollWriteText } from '../../components/common/ScrollWriteText';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SEO } from '../../components/SEO';
import { personSchema } from '../../utils/seo';

export function SkillsPage() {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};
  const containerRef = useRef(null);

  const allSkillNames = (appState.skills || []).flatMap((c) => (c.items || []).map((i) => i.name)).filter(Boolean);

  return (
    <main className="skills-page min-h-screen" ref={containerRef}>
      <SEO
        title="Skills & Tech Stack"
        description="Ayush Prajapati's comprehensive technical stack, architectural proficiencies, and software competencies across frontend, backend, databases, languages, and developer tools."
        schema={personSchema(appState.profile, { knowsAbout: allSkillNames.length > 0 ? allSkillNames : undefined })}
      />
      
      {/* Page Header */}
      <div className="page-header">
        <ScrollWriteText
          as="div"
          className="page-tagline"
          mode="scramble"
          scrambleDuration={20}
        >
          {(ui.homeSkillsEyebrow || '02 · TECHNICAL CAPABILITIES').replace(/^03\b/, '02')}
        </ScrollWriteText>
        <ScrollWriteText
          as="h1"
          className="page-title hero-editorial-title text-left !m-0 !p-0 !max-w-none"
          mode="mask"
          stagger={0.04}
          highlightWords={['Tech', 'Stack']}
        >
          Skills & *Tech Stack*
        </ScrollWriteText>
        <ScrollWriteText
          as="p"
          className="page-desc mt-4"
          mode="words"
          stagger={0.02}
        >
          A complete overview of my technical proficiencies across frontend, backend, databases, programming languages, and developer tools.
        </ScrollWriteText>
      </div>

      <div className="skills-content-wrap">
        <InteractiveSkillsWidget isStandalonePage={true} />
      </div>
    </main>
  );
}

export default SkillsPage;
