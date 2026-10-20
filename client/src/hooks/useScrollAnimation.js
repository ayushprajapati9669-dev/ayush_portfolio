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

        const revealBlocks = document.querySelectorAll('.scroll-reveal');
        revealBlocks.forEach((el, idx) => {
          const t = gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              delay: (idx % 3) * 0.06,
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
    }, 100);

    return () => {
      clearTimeout(timer);
      triggers.forEach((t) => t.kill());
    };
  }, [dependencyKey]);
}
