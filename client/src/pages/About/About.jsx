import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { personSchema } from '../../utils/seo';
import { ScrollWriteText } from '../../components/common/ScrollWriteText';

export function AboutPage() {
  const { appState } = usePortfolio();
  const navigate = useNavigate();
  const p = appState.profile || {};
  const containerRef = useRef(null);

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
      rotateX: ((y - rect.height / 2) / rect.height) * -3.5,
      rotateY: ((x - rect.width / 2) / rect.width) * 3.5,
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
      gsap.fromTo('.page-header > *', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo('.top-section .about-card', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo('.education-card', 
        { y: 35, opacity: 0, scale: 0.96 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out', delay: 0.15, clearProps: 'all' }
      );

      gsap.fromTo('.about-journey-cta-card',
        { y: 35, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out', delay: 0.22, clearProps: 'all' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3D Cinzel Infinite Loop Reveal + Mouse Parallax Tilt for Name Heading
  useEffect(() => {
    function splitTextIntoChars(element) {
      if (!element) return [];
      const text = element.innerText;
      element.innerHTML = '';
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.overflow = 'hidden';
      [...text].forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        charSpan.className = 'char';
        if (char === ' ') charSpan.innerHTML = '&nbsp;';
        wordSpan.appendChild(charSpan);
      });
      element.appendChild(wordSpan);
      return wordSpan.querySelectorAll('.char');
    }

    const word1El = document.getElementById('word1');
    const word2El = document.getElementById('word2');
    if (!word1El || !word2El) return;

    const charsAyush = splitTextIntoChars(word1El);
    const charsPrajapati = splitTextIntoChars(word2El);

    gsap.set([charsAyush, charsPrajapati], { y: '100%', opacity: 0, rotateX: -90 });

    const tl = gsap.timeline({
      delay: 0.2,
      repeat: -1,
      repeatDelay: 2.5
    });

    tl.to(charsAyush, {
      y: '0%',
      opacity: 1,
      rotateX: 0,
      duration: 1.2,
      stagger: 0.05,
      ease: 'power4.out'
    })
      .to(
        charsPrajapati,
        {
          y: '0%',
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.05,
          ease: 'power4.out'
        },
        '-=1.0'
      )
      .to([charsAyush, charsPrajapati], { duration: 1.5 });

    const nameHeading = document.getElementById('mainName');
    const handleMouseMove = (e) => {
      if (!nameHeading) return;
      const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
      gsap.to(nameHeading, {
        rotationY: xAxis,
        rotationX: -yAxis,
        ease: 'power2.out',
        duration: 0.5
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      tl.kill();
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const profileImageUrl = p.portrait?.url || p.profileImage || '/images/ayush-hero-portrait.jpg';
  const githubUrl = p.socialLinks?.github || 'https://github.com/ayushprajapati9669-dev';
  const linkedinUrl = p.socialLinks?.linkedin || 'https://www.linkedin.com/in/ayush-prajapati-b9042424a/';
  const instagramUrl = p.socialLinks?.instagram || 'https://www.instagram.com/ayush7162/';

  return (
    <main className="about-page" ref={containerRef}>
      <SEO
        title="About & Academic Profile | Ayush Prajapati"
        description="Learn about Ayush Prajapati's background, education at SISTec Bhopal (CGPA 8.42), engineering philosophy, and full-stack software expertise."
        schema={personSchema(p)}
      />

      {/* 1. Header */}
      <div className="page-header">
        <ScrollWriteText
          as="div"
          className="page-tagline"
          mode="scramble"
          scrambleDuration={20}
        >
          {p.aboutEyebrow || p.eyebrow || 'Computer Science Student · Developer · Builder'}
        </ScrollWriteText>
        <h1 className="name-heading" id="mainName">
          <span className="word-wrapper" id="word1">Ayush</span>
          <span className="word-wrapper gold-text" id="word2">Prajapati</span>
        </h1>
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
              background: 'rgba(212, 175, 55, 0.1)',
              borderColor: 'rgba(212, 175, 55, 0.3)',
              color: 'var(--accent-1, #d4af37)'
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

      {/* 2. Top Section: Bio Card + Profile Card */}
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
            <span>About & Academic Profile</span>
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

        {/* Profile Card */}
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

      {/* 3. Education Qualifications Card (Dynamic from CMS) */}
      <div className="education-section">
        <div
          className="about-card education-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <h3>
            <span className="realistic-icon">
              <i className="fa-solid fa-graduation-cap" />
            </span>{' '}
            <span>Education Qualifications</span>
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
                {p.education?.schoolScore || '80%'}{' '}
                <span>2022</span>
              </div>
              <div className="edu-title">
                {p.education?.schoolBoard || 'MP board'}
              </div>
              <div className="edu-subtitle">
                {p.education?.schoolXII || 'Higher Secondary (Class XII)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Journey & Milestones CTA Card */}
      <div className="about-journey-cta-wrapper">
        <div
          className="about-journey-cta-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="cta-content">
            <div className="cta-badge">
              <i className="fa-solid fa-trophy" />
              <span>Track Record & Milestones</span>
            </div>
            <h2>Discover My Journey</h2>
          </div>
          <button
            type="button"
            className="cta-explore-btn magnetic"
            onMouseMove={handleMagneticMouseMove}
            onMouseLeave={handleMagneticMouseLeave}
            onClick={() => {
              playTick();
              navigate('/journey');
            }}
          >
            <span>Explore Full Journey</span>
            <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default AboutPage;
