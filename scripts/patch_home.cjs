const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'Home', 'Home.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Hero timeline animations
const oldHeroCta = `.from(
          '.hero-cta-btn',
          {
            y: 25,
            opacity: 0,
            scale: 0.95,
            stagger: 0.12,
            duration: 0.6,
            ease: 'back.out(1.2)'
          },
          '-=0.4'
        )`;

const newHeroCta = `.fromTo(
          '.hero-cta-btn',
          {
            y: 20,
            opacity: 0,
            scale: 0.95
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'back.out(1.2)',
            clearProps: 'all'
          },
          '-=0.35'
        )`;

if (content.includes(oldHeroCta)) {
  content = content.replace(oldHeroCta, newHeroCta);
  console.log('Replaced hero-cta-btn animation');
} else {
  console.log('oldHeroCta not found directly, checking normalized');
}

// Add clearProps to other hero elements
content = content.replace("delay: 0.1\n        })", "delay: 0.1,\n          clearProps: 'all'\n        })");
content = content.replace("delay: 0.1\r\n        })", "delay: 0.1,\r\n          clearProps: 'all'\r\n        })");

// Replace hero section spacing
content = content.replace(
  'pt-28 pb-16 sm:px-6 lg:px-8 sm:pt-32 lg:pt-36',
  'pt-24 pb-12 sm:px-6 lg:px-8 sm:pt-28 lg:pt-28 lg:pb-14'
);

content = content.replace(
  '<div className="lg:col-span-5 space-y-6">',
  '<div className="lg:col-span-5 space-y-4">'
);

content = content.replace(
  'lg:text-[3.35rem] leading-[1.08]',
  'lg:text-[2.85rem] xl:text-[3.25rem] leading-[1.1]'
);

// Guard GSAP selectors
const oldBentoFocus = `gsap.from('.bento-focus-card', {
        scrollTrigger: {
          trigger: '.bento-focus-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        scale: 0.95,
        stagger: 0.12,
        duration: 0.75,
        ease: 'back.out(1.2)'
      });`;

const newBentoFocus = `const bentoCards = containerRef.current.querySelectorAll('.bento-focus-card');
      if (bentoCards.length > 0) {
        gsap.from(bentoCards, {
          scrollTrigger: {
            trigger: '.bento-focus-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          scale: 0.95,
          stagger: 0.12,
          duration: 0.75,
          ease: 'back.out(1.2)'
        });
      }`;

const oldProj = `gsap.from('.projects-home-grid .project-card', {
        scrollTrigger: {
          trigger: '.projects-home-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        scale: 0.96,
        stagger: 0.15,
        duration: 0.85,
        ease: 'back.out(1.2)'
      });`;

const newProj = `const projCards = containerRef.current.querySelectorAll('.projects-home-grid .project-card');
      if (projCards.length > 0) {
        gsap.from(projCards, {
          scrollTrigger: {
            trigger: '.projects-home-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 50,
          opacity: 0,
          scale: 0.96,
          stagger: 0.15,
          duration: 0.85,
          ease: 'back.out(1.2)'
        });
      }`;

const oldCerts = `gsap.from('.certs-home-grid .cert-card', {
        scrollTrigger: {
          trigger: '.certs-home-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 45,
        opacity: 0,
        scale: 0.96,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });`;

const newCerts = `const certCards = containerRef.current.querySelectorAll('.certs-home-grid .cert-card');
      if (certCards.length > 0) {
        gsap.from(certCards, {
          scrollTrigger: {
            trigger: '.certs-home-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 45,
          opacity: 0,
          scale: 0.96,
          stagger: 0.15,
          duration: 0.8,
          ease: 'back.out(1.2)'
        });
      }`;

const oldJourney = `gsap.from('.journey-card', {
        scrollTrigger: {
          trigger: '.journey-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        scale: 0.96,
        stagger: 0.14,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });`;

const newJourney = `const journeyCards = containerRef.current.querySelectorAll('.journey-card');
      if (journeyCards.length > 0) {
        gsap.from(journeyCards, {
          scrollTrigger: {
            trigger: '.journey-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          scale: 0.96,
          stagger: 0.14,
          duration: 0.8,
          ease: 'back.out(1.2)'
        });
      }`;

// Normalize line endings for replacement
const normalizeLf = (s) => s.replace(/\r\n/g, '\n');
let normContent = normalizeLf(content);

normContent = normContent.replace(normalizeLf(oldHeroCta), normalizeLf(newHeroCta));
normContent = normContent.replace(normalizeLf(oldBentoFocus), normalizeLf(newBentoFocus));
normContent = normContent.replace(normalizeLf(oldProj), normalizeLf(newProj));
normContent = normContent.replace(normalizeLf(oldCerts), normalizeLf(newCerts));
normContent = normContent.replace(normalizeLf(oldJourney), normalizeLf(newJourney));

fs.writeFileSync(filePath, normContent, 'utf8');
console.log('Successfully patched Home.jsx!');

