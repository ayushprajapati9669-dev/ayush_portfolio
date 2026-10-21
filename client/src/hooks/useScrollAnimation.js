import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useScrollAnimation(dependencyKey) {
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let triggers = [];

    const timer = setTimeout(() => {
      try {
        gsap.registerPlugin(ScrollTrigger);

        // 1. Standard Scroll Reveal (Fade Up)
        const revealBlocks = document.querySelectorAll('.scroll-reveal:not(.scroll-animated)');
        revealBlocks.forEach((el, idx) => {
          el.classList.add('scroll-animated');
          const t = gsap.fromTo(
            el,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              delay: (idx % 3) * 0.08,
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

        // 2. Staggered Children Reveal (Grids / Lists)
        const staggerContainers = document.querySelectorAll('.scroll-reveal-stagger:not(.scroll-animated)');
        staggerContainers.forEach((container) => {
          container.classList.add('scroll-animated');
          const children = container.children;
          if (children.length > 0) {
            const t = gsap.fromTo(
              children,
              { opacity: 0, y: 30, scale: 0.98 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                stagger: 0.09,
                ease: 'back.out(1.15)',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                  trigger: container,
                  start: 'top 88%',
                  toggleActions: 'play none none none'
                }
              }
            );
            if (t.scrollTrigger) triggers.push(t.scrollTrigger);
          }
        });

        // 3. Scale Reveal (Banners / Feature Cards)
        const scaleBlocks = document.querySelectorAll('.scroll-reveal-scale:not(.scroll-animated)');
        scaleBlocks.forEach((el) => {
          el.classList.add('scroll-animated');
          const t = gsap.fromTo(
            el,
            { opacity: 0, scale: 0.94, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
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

        // 4. Slide-in from Left
        const leftBlocks = document.querySelectorAll('.scroll-reveal-left:not(.scroll-animated)');
        leftBlocks.forEach((el) => {
          el.classList.add('scroll-animated');
          const t = gsap.fromTo(
            el,
            { opacity: 0, x: -40 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
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
            { opacity: 0, x: 40 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
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

        ScrollTrigger.refresh();
      } catch (_err) {
        // Fallback if ScrollTrigger is unavailable
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      triggers.forEach((t) => t.kill());
    };
  }, [dependencyKey]);
}

