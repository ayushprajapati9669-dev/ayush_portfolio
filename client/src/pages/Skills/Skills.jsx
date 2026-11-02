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
        title="Technical Skills & Stack"
        description="Comprehensive matrix of Ayush Prajapati's software competencies: React, Node.js, Express, MongoDB, Data Structures, Java, C, Python, SQL, REST APIs, and DevOps tools."
        schema={personSchema(appState.profile, { knowsAbout: allSkillNames.length > 0 ? allSkillNames : undefined })}
      />
      
      {/* Page Header - 100% Unified with Projects, Certificates, About, and Contact pages */}
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
          className="page-title"
          mode="mask"
          stagger={0.04}
          highlightWords={['Skills']}
        >
          Interactive Skills & Tech Stack
        </ScrollWriteText>
        <ScrollWriteText
          as="p"
          className="page-desc"
          mode="words"
          stagger={0.02}
        >
          Full-stack proficiency across languages, modern frontend systems, backend APIs, distributed databases, and engineering developer tools.
        </ScrollWriteText>
      </div>

      <div className="skills-content-wrap">
        <InteractiveSkillsWidget isStandalonePage={true} />
      </div>
    </main>
  );
}

export default SkillsPage;
