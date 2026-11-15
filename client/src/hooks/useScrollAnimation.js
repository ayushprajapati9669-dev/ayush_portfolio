import { useEffect } from 'react';
import { runOnIdle, cancelIdle } from '../utils/idle';

export function useScrollAnimation(dependencyKey) {
  useEffect(() => {
    // HomePage and Admin dashboard have their own optimized GSAP contexts and entrance animations.
    if (
      !dependencyKey ||
      dependencyKey === '/' ||
      dependencyKey.startsWith('/admin') ||
      dependencyKey.startsWith('/login') ||
      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      return;
    }

    let triggers = [];
    let idleHandle = null;

    const setupAnimations = async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ]);
        gsap.registerPlugin(ScrollTrigger);

        // 1. Standard Scroll Reveal (Fade Up)
        const revealBlocks = document.querySelectorAll('.scroll-reveal:not(.scroll-animated)');
        revealBlocks.forEach((el, idx) => {
          el.classList.add('scroll-animated');
          const t = gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              delay: (idx % 4) * 0.06,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
              }
            }
          );
          if (t.scrollTrigger) triggers.push(t.scrollTrigger);
        });

        // 2. Staggered Children Reveal (Grids / Lists / Cards)
        const staggerContainers = document.querySelectorAll(
          '.scroll-reveal-stagger:not(.scroll-animated), .stats-grid:not(.scroll-animated), .admin-content-area .grid:not(.scroll-animated)'
        );
        staggerContainers.forEach((container) => {
          container.classList.add('scroll-animated');
          const children = Array.from(container.children).filter(
            (el) => !el.classList.contains('no-stagger')
          );
          if (children.length > 0) {
            const t = gsap.fromTo(
              children,
              { opacity: 0, y: 24, scale: 0.97 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.55,
                stagger: 0.05,
                ease: 'power2.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                  trigger: container,
                  start: 'top 92%',
                  toggleActions: 'play none none none'
                }
              }
            );
            if (t.scrollTrigger) triggers.push(t.scrollTrigger);
          }
        });

        // 3. Scale Reveal (Banners / Feature Cards / Lightbox Previews)
        const scaleBlocks = document.querySelectorAll('.scroll-reveal-scale:not(.scroll-animated)');
        scaleBlocks.forEach((el) => {
          el.classList.add('scroll-animated');
          const t = gsap.fromTo(
            el,
            { opacity: 0, scale: 0.94, y: 18 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none'
              }
            }
          );
          if (t.scrollTrigger) triggers.push(t.scrollTrigger);
        });

        // 4. Slide-in from Left (Timeline / Headings)
        const leftBlocks = document.querySelectorAll('.scroll-reveal-left:not(.scroll-animated)');
        leftBlocks.forEach((el) => {
          el.classList.add('scroll-animated');
          const t = gsap.fromTo(
            el,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.7,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
              }
            }
          );
          if (t.scrollTrigger) triggers.push(t.scrollTrigger);
        });

        // 5. Slide-in from Right
        const rightBlocks = document.querySelectorAll('.scroll-reveal-right:not(.scroll-animated)');
        rightBlocks.forEach((el) => {
          el.classList.add('scroll-animated');
          const t = gsap.fromTo(
            el,
            { opacity: 0, x: 30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.7,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
              }
            }
          );
          if (t.scrollTrigger) triggers.push(t.scrollTrigger);
        });

        if (triggers.length > 0) {
          ScrollTrigger.refresh();
        }
      } catch (_err) {
        // Fallback if ScrollTrigger is unavailable
      }
    };

    idleHandle = runOnIdle(setupAnimations, { timeout: 1200 });

    return () => {
      cancelIdle(idleHandle);
      triggers.forEach((t) => t.kill());
    };
  }, [dependencyKey]);
}

export default useScrollAnimation;
