import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { personSchema } from '../../utils/seo';
import { MilestoneSpotlightSlider } from '../../components/ui/MilestoneSpotlightSlider';
import { TechLogo } from '../../components/common/TechLogos';
import { LeetCodeMetricsBadge } from '../../components/ui/LeetCodeMetricsBadge';

export function AboutPage() {
  const { appState } = usePortfolio();
  const navigate = useNavigate();
  const p = appState.profile || {};
  const containerRef = useRef(null);

  // Default / Baseline Milestones matching Reference HTML
  const defaultMilestones = [
    {
      phase: 'Full-Stack Practice',
      yearBadge: 'Year 3',
      title: 'MERN Stack & Interactive Systems',
      description:
        'Building a Zerodha-inspired trading dashboard and a ChatGPT-inspired conversational AI workspace.'
    },
    {
      phase: 'Foundation',
      yearBadge: 'Year 1-2',
      title: 'Core Programming & CS Fundamentals',
      description:
        'Strong foundation in C, Java, Python, OOP, MySQL, and HTML/CSS.'
    },
    {
      phase: 'Current Focus',
      yearBadge: 'Present',
      title: 'Algorithmic Depth & AI Integration',
      description:
        'Deepening DSA fluency and exploring practical AI/ML integration.'
    }
  ];

  // Map CMS learningJourney or fallback to defaultMilestones
  const milestones =
    p.learningJourney && Array.isArray(p.learningJourney) && p.learningJourney.length > 0
      ? p.learningJourney
          .filter((m) => m.published !== false)
          .map((m, idx) => ({
            ...m,
            id: m.id || `m-${idx}`,
            phase: m.phase || m.metaLabel || `Phase ${idx + 1}`,
            yearBadge: m.yearBadge || m.year || (idx === 0 ? 'Year 3' : idx === 1 ? 'Year 1-2' : 'Present'),
            title: m.title,
            description: m.description || m.desc || m.detail || '',
            desc: m.desc || m.description || m.detail || '',
            icon: m.icon || 'fa-layer-group',
            status: m.status,
            metric: m.metric,
            image: m.image || (Array.isArray(m.images) && m.images[0]) || null,
            images: Array.isArray(m.images) && m.images.length > 0 ? m.images : (m.image ? [m.image] : []),
            hdImages: Array.isArray(m.hdImages) && m.hdImages.length > 0 ? m.hdImages : (Array.isArray(m.images) && m.images.length > 0 ? m.images : (m.image ? [m.image] : [])),
            link: m.link || '',
            progress: m.progress !== undefined ? Number(m.progress) : null,
            rating: m.rating !== undefined ? Number(m.rating) : 0,
            spotlight: m.spotlight !== undefined ? Boolean(m.spotlight) : Boolean(m.pinned),
            pinned: Boolean(m.pinned),
            skills: Array.isArray(m.skills)
              ? m.skills
              : Array.isArray(m.tags)
              ? m.tags
              : m.skills
              ? m.skills.split(',').map((s) => s.trim()).filter(Boolean)
              : m.tags
              ? m.tags.split(',').map((s) => s.trim()).filter(Boolean)
              : []
          }))
      : defaultMilestones;

  // Separate into spotlight highlights vs journey timeline items
  const spotlightMilestones = useMemo(() => {
    const list = milestones.filter((m) => m.spotlight === true || (m.spotlight === undefined && m.pinned === true));
    return list.length > 0 ? list : milestones;
  }, [milestones]);

  const timelineMilestones = useMemo(() => {
    const nonSpotlight = milestones.filter((m) => !m.spotlight && !m.pinned);
    return nonSpotlight.length > 0 ? nonSpotlight : milestones;
  }, [milestones]);

  // 3D Card Tilt Physics
  const handleCardMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    gsap.to(card, {
      rotateX: ((y - rect.height / 2) / rect.height) * -4,
      rotateY: ((x - rect.width / 2) / rect.width) * 4,
      transformPerspective: 1500,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // Magnetic Button Physics
  const handleMagneticMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;

    gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out' });
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
  };

  // Entrance Animations
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.page-header > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      gsap.from('.top-section .about-card', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: 'back.out(1.2)'
      });

      gsap.from('.spotlight-section .about-card', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.2)',
        delay: 0.1
      });

      gsap.from('.bottom-section .about-card', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: 'back.out(1.2)',
        delay: 0.15
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const profileImageUrl = p.portrait?.url || p.profileImage || '/images/ayush-hero-portrait.jpg';
  const githubUrl = p.socialLinks?.github || 'https://github.com/ayushprajapati9669-dev';
  const linkedinUrl = p.socialLinks?.linkedin || 'https://www.linkedin.com/in/ayush-prajapati-b9042424a/';
  const instagramUrl = p.socialLinks?.instagram || 'https://www.instagram.com/ayush7162/';

  return (
    <main className="about-page" ref={containerRef}>
      <SEO
        title="About & Academic Milestones"
        description="Learn about Ayush Prajapati's background, education at SISTec Bhopal (CGPA 8.42), engineering roadmap, achievements, and full-stack software expertise."
        schema={personSchema(p)}
      />
      {/* Header */}
      <div className="page-header">
        <div className="page-tagline">
          {p.aboutEyebrow || p.eyebrow || 'Computer Science Student · Developer · Builder'}
        </div>
        <h1 className="page-title">{p.name || 'Ayush Prajapati'}</h1>
        <div className="page-contact-info">
          <a
            href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`}
            className="contact-item magnetic"
            onMouseMove={handleMagneticMouseMove}
            onMouseLeave={handleMagneticMouseLeave}
            onClick={() => playTick()}
          >
            <i className="fa-regular fa-envelope" /> {p.email || 'ayushprajapati9669@gmail.com'}
          </a>

          <a
            href={`tel:${p.phone?.replace(/[^0-9+]/g, '') || '+919669802554'}`}
            className="contact-item magnetic"
            onMouseMove={handleMagneticMouseMove}
            onMouseLeave={handleMagneticMouseLeave}
            onClick={() => playTick()}
          >
            <i className="fa-solid fa-phone" /> {p.phone || '(+91) 9669802554'}
          </a>

          <button
            type="button"
            className="contact-item magnetic"
            style={{
              background: 'rgba(6, 182, 212, 0.1)',
              borderColor: 'rgba(6, 182, 212, 0.3)',
              color: 'var(--accent-1, #06b6d4)'
            }}
            onMouseMove={handleMagneticMouseMove}
            onMouseLeave={handleMagneticMouseLeave}
            onClick={() => {
              playTick();
              navigate('/contact');
            }}
          >
            Get In Touch <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </div>

      {/* Top Section: Bio Card + Profile Card */}
      <div className="top-section">
        {/* Bio Card */}
        <div
          className="about-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <h3>
            <span className="realistic-icon">
              <i className="fa-solid fa-user-astronaut" />
            </span>{' '}
            About & Academic Profile
          </h3>

          {p.aboutBio && Array.isArray(p.aboutBio) && p.aboutBio.length > 0 ? (
            p.aboutBio.map((paragraph, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))
          ) : (
            <>
              <p>
                I am a third-year <strong>B.Tech Computer Science and Engineering</strong> student at
                SISTec, Bhopal, focused on building full-stack web applications with the MERN stack
                and strengthening my core software engineering fundamentals.
              </p>
              <p>
                Alongside developing full-stack interfaces and REST APIs with React, Node.js, Express,
                and MongoDB, I actively practice <strong>Data Structures and Algorithms</strong> in C,
                Java, and Python to sharpen how I reason about time complexity, state, and system design.
              </p>
              <p>
                I am also exploring <strong>Artificial Intelligence and Machine Learning</strong>—specifically
                how modern conversational workflows and intelligent tooling can be integrated cleanly
                into practical web software.
              </p>
            </>
          )}
        </div>

        {/* Profile Card with Animated Ring */}
        <div
          className="about-card profile-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="avatar-ring">
            <div className="profile-img-wrap">
              <span className="initials-fallback">{p.monogram || 'AP'}</span>
              <img
                className="profile-img"
                src={profileImageUrl}
                alt={p.name || 'Ayush Prajapati'}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="profile-details">
            <h2>{p.name || 'Ayush Prajapati'}</h2>
            <p>
              {p.education?.degree || 'B.Tech CSE'} | {p.education?.college || 'SISTec'} (
              {p.education?.cgpa || '8.42 CGPA'})
            </p>

            <div className="social-links">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn magnetic"
                aria-label="GitHub"
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-github" />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn magnetic"
                aria-label="LinkedIn"
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-linkedin-in" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn magnetic"
                aria-label="Instagram"
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-instagram" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Milestone Spotlight Carousel (Hackathons, SDE Internships, High-Impact Wins) */}
      <div className="spotlight-section">
        <MilestoneSpotlightSlider
          milestones={spotlightMilestones}
          onCardMouseMove={handleCardMouseMove}
          onCardMouseLeave={handleCardMouseLeave}
          onMagneticMouseMove={handleMagneticMouseMove}
          onMagneticMouseLeave={handleMagneticMouseLeave}
        />
      </div>

      {/* LeetCode & Problem Solving Metrics */}
      <div className="max-w-6xl mx-auto px-4 my-8">
        <LeetCodeMetricsBadge />
      </div>

      {/* Bottom Section: Education + Timeline */}
      <div className="bottom-section">
        {/* Education Qualifications */}
        <div
          className="about-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <h3>
            <span className="realistic-icon">
              <i className="fa-solid fa-graduation-cap" />
            </span>{' '}
            Education Qualifications
          </h3>

          <div className="edu-grid">
            <div className="edu-item">
              <div className="edu-score">
                {p.education?.cgpa?.replace(/[^0-9.]/g, '') || '8.42'}{' '}
                <span>CGPA</span>
              </div>
              <div className="edu-title">
                {p.education?.degree || 'B.Tech in Computer Science and Engineering'}
              </div>
              <div className="edu-subtitle">
                {p.education?.college || 'SISTec (Sagar Institute of Science and Technology)'}
              </div>
            </div>

            <div className="edu-item">
              <div className="edu-score">
                {p.education?.schoolScore || '83.5%'}{' '}
                <span>2022</span>
              </div>
              <div className="edu-title">
                {p.education?.schoolBoard || 'MP Board (Class XII)'}
              </div>
              <div className="edu-subtitle">
                {p.education?.schoolXII || 'Kasturba Vidhya Mandir, Jamani, MP'}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Journey Timeline */}
        <div
          className="about-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <h3>
            <span className="realistic-icon">
              <i className="fa-solid fa-trophy" />
            </span>{' '}
            Achievements & Journey
          </h3>

          <div className="timeline-list">
            {timelineMilestones.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-year">
                  <span>{item.phase}</span>
                  <span>· {item.yearBadge}</span>
                  {item.status && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        marginLeft: 'auto',
                        background:
                          item.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : item.status === 'planned'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'rgba(6, 182, 212, 0.15)',
                        color:
                          item.status === 'completed'
                            ? '#34d399'
                            : item.status === 'planned'
                            ? '#c084fc'
                            : '#22d3ee',
                        border: `1px solid ${
                          item.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.3)'
                            : item.status === 'planned'
                            ? 'rgba(168, 85, 247, 0.3)'
                            : 'rgba(6, 182, 212, 0.3)'
                        }`
                      }}
                    >
                      {item.status === 'completed'
                        ? 'Completed'
                        : item.status === 'planned'
                        ? 'Target'
                        : 'Current Focus'}
                    </span>
                  )}
                </div>
                <div className="timeline-title flex items-center justify-between gap-2">
                  <span>{item.title}</span>
                  {item.metric && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: '700',
                        color: 'var(--accent-1, #06b6d4)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        flexShrink: 0
                      }}
                    >
                      {item.metric}
                    </span>
                  )}
                </div>
                <div
                  className="timeline-desc"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="max-h-36 rounded-lg mt-2.5 border border-white/10 object-cover"
                  />
                )}
                {item.progress !== null && item.status === 'focus' && (
                  <div className="mt-2.5 max-w-xs">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {item.progress}% progress
                    </span>
                  </div>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold mt-2"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                    <span>View Project Resource</span>
                  </a>
                )}
                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {item.skills.map((sk, skIdx) => (
                      <span
                        key={skIdx}
                        className="inline-flex items-center gap-1.5"
                        style={{
                          fontSize: '11px',
                          fontFamily: 'JetBrains Mono, monospace',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#e2e8f0'
                        }}
                      >
                        <TechLogo name={sk} className="w-3.5 h-3.5 shrink-0" />
                        <span>{sk}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AboutPage;

